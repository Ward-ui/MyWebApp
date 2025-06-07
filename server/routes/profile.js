const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { models } = require("../models"); // Получаем объект моделей
const { User, Order } = models; // Извлекаем User и Order из models


// Получить данные пользователя
router.get("/orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.userId },
            include: [
  {
    model: models.OrderItem,
    as: 'OrderItems',
    include: [{
      model: models.Product,
      as: 'Product'  // алиас должен совпадать с определением в модели
    }]
  }
],
            order: [["createdAt", "DESC"]]
        });

        res.json(orders);
    } catch (error) {
        console.error("Ошибка при получении заказов:", error.message);
        res.status(500).send("Ошибка при получении заказов");
    }
});


router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }
        res.json({ name: user.username, email: user.email, phone: user.phone, fullName: user.fullName, address: user.address });
    } catch (error) {
        res.status(500).send('Ошибка при получении данных пользователя');
    }
});


// Обновить данные пользователя
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, fullName, address } = req.body;
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.fullName = fullName || user.fullName;
    user.address = address || user.address;

    await user.save();

    res.json({ message: "Данные пользователя обновлены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});



module.exports = router;
