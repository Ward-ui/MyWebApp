const { models } = require('./models');
const {Order} = models;// путь может отличаться
const { sequelize } = require('./models');
const { Sequelize } = require('sequelize');

async function addOrder() {
  try {
    await sequelize.authenticate();
    console.log('Соединение с БД установлено');

   const newOrder = await Order.create({
      userId: 1, // укажи ID существующего пользователя
      orderDate: new Date('2025-01-28T12:00:00Z'),
      totalAmount: 5000,
      status: 'выполнен',
      paymentStatus: 'оплачен'
    });
    console.log('Заказ добавлен:', newOrder.toJSON());

    await sequelize.close();
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

addOrder();
