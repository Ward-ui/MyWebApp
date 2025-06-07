const express = require('express');
const router = express.Router();
const { models } = require("../models");
const Order = models.Order;
const { sequelize } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { Sequelize, Op } = require('sequelize'); // Импортируем Sequelize и Op
const { getIncomeForPeriod } = require("../service/salesService");


router.get("/sales", async (req, res) => {
  try {
    const { period } = req.query;

    if (!period) {
      return res.status(400).json({ message: "Параметр 'period' обязателен" });
    }

    const income = await getIncomeForPeriod(period);
    res.json({ totalIncome: income });
  } catch (error) {
    console.error("Ошибка на сервере:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// дашборд
router.post('/sales', async (req, res) => {
  try {
    const { period } = req.body;

    // Устанавливаем условия для фильтрации заказов
    const whereConditions = {
      status: 'выполнен',
      paymentStatus: 'оплачен'
    };

    // Добавляем фильтрацию по периоду
    const now = new Date();

// Для месяца — берем первый день предыдущего месяца (или текущего месяца?)
// Чтобы получить продажи за текущий месяц с 1-го числа по сегодняшний день:
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // первый день следующего месяца

// Для года — первый день января текущего года
const startOfYear = new Date(now.getFullYear(), 0, 1);
const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

if (period === 'month') {
  whereConditions.orderDate = {
    [Op.gte]: startOfMonth,
    [Op.lt]: endOfMonth
  };
} else if (period === 'year') {
  whereConditions.orderDate = {
    [Op.gte]: startOfYear,
    [Op.lt]: endOfYear
  };
}

console.log('Период:', period);
console.log('Условия where:', whereConditions);

    

const orders = await Order.findAll({
  where: whereConditions,
});


    // Рассчитываем общую выручку
    const totalIncome = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Отправляем результат
    res.json({ totalIncome });
  } catch (error) {
    console.error("Ошибка при расчете дохода:", error);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});


// Получить все заказы
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новый заказ
router.post('/', authMiddleware, async (req, res) => {
  try {
      const { items } = req.body;
      const userId = req.user.userId;  // Извлекаем userId из токена

      if (!items || items.length === 0) {
          return res.status(400).json({ message: "Корзина пуста" });
      }

      // Создаем заказ
      const order = await models.Order.create({
          userId,
          orderDate: new Date(),
          totalAmount: 0, // Инициализируем сумму (позже пересчитаем)
          status: 'Ожидает оплаты'.toLowerCase(),  // Приводим статус к нижнему регистру
          paymentStatus: 'не оплачено'.toLowerCase(),  // Приводим paymentStatus к нижнему регистру
          customerId: req.body.customerId || null,
          discountId: req.body.discountId || null
      });

      // Перемещаем товары из корзины в заказ
      let totalAmount = 0;
      for (const item of items) {
          const product = await models.Product.findByPk(item.productId);
          if (!product) {
              
              continue;
          }

          

          // Создаем запись в OrderItem
          await models.OrderItem.create({
              orderId: order.id,
              productId: product.id,
              quantity: item.quantity,
              price: product.price,
              totalAmount: product.price * item.quantity
          });

          totalAmount += product.price * item.quantity;
      }

      // Обновляем общую сумму заказа
      order.totalAmount = totalAmount;
      await order.save();

      // Очищаем корзину после создания заказа
      await models.Cart.destroy({ where: { userId } });

      res.status(201).json({ message: "Заказ успешно создан", orderId: order.id, totalAmount });
  } catch (error) {
      console.error("Ошибка при создании заказа:", error.message);
      res.status(500).json({ message: "Ошибка при создании заказа" });
  }
});

// 
router.get('/:orderId/items', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
       where: { 
         id: orderId,               // фильтр по id заказа
        userId: req.user.userId
        },
            include: [
            {
              model: models.OrderItem,
              as: 'OrderItems',
              include: [{
                model: models.Product,
                as: 'Product'  // алиас должен совпадать с определением в модели
              }]
            }
          ]
        });

    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    // Возвращаем данные о заказе
    const orderData = {
      id: order.id,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      items: order.OrderItems.map(item => ({
        product: item.Product,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.totalAmount
      }))
    };

    res.json(orderData);
  } catch (error) {
    console.error("Ошибка при загрузке заказа:", error);
    res.status(500).json({ message: "Ошибка при загрузке заказа" });
  }
});

// Оплата заказа
router.post("/:orderId/pay", authMiddleware, async (req, res) => {
    const transaction = await sequelize.transaction(); // Начинаем транзакцию
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        // Ищем заказ, который принадлежит текущему пользователю
        const order = await models.Order.findOne({
            where: { id: orderId, userId },
            transaction  // Указываем транзакцию
        });

        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        // Проверка статуса
        if (order.status !== "ожидает оплаты" || order.paymentStatus !== "не оплачено") {
            return res.status(400).json({ message: "Этот заказ уже оплачен или отменен" });
        }

        // Меняем статус на "Оплачен" и "оплачено"
        order.status = "оплачен";  // Изменили статус заказа
        order.paymentStatus = "оплачен";  // Добавили изменение статуса оплаты
        await order.save({ transaction }); // Сохраняем заказ в рамках транзакции

        // Если все прошло успешно, коммитим транзакцию
        await transaction.commit();

        res.json({ message: "Оплата успешно произведена" });
    } catch (error) {
        console.error("Ошибка при оплате заказа:", error);
        await transaction.rollback(); // Если ошибка, откатываем транзакцию
        res.status(500).json({ message: "Ошибка сервера" });
    }
});



module.exports = router;
