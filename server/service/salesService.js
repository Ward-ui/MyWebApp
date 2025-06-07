const { Op } = require('sequelize');
const { models } = require('../models'); // Убедитесь, что путь правильный


const Order = models.Order; // Доступ к модели Order

// Функция для получения дохода за выбранный период
async function getIncomeForPeriod(period) {
  let startDate, endDate;
  const currentDate = new Date();

  // Устанавливаем начало и конец периода
  if (period === 'month') {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59); // Последний момент месяца
  } else if (period === 'year') {
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    endDate = new Date(currentDate.getFullYear(), 12, 0, 23, 59, 59); // Последний момент года
  } else {
    throw new Error('Некорректный период');
  }

  try {
    // Получаем все заказы за выбранный период
    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        status: 'completed', // Только завершенные заказы
      },
    });

    // Если заказов нет, возвращаем 0
    if (orders.length === 0) {
      return { totalIncome: 0 };
    }

    // Расчет дохода
    const totalIncome = orders.reduce((sum, order) => {
      const amount = parseFloat(order.totalAmount);
      return sum + (isNaN(amount) ? 0 : amount); // Проверяем, чтобы totalAmount было числом
    }, 0);

    // Возвращаем результат
    return { totalIncome };
  } catch (error) {
    console.error('Ошибка при получении данных дохода:', error);
    return { totalIncome: 0 };
  }
}

module.exports = {
  getIncomeForPeriod,
};
