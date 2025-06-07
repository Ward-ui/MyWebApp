'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Reviews', 'productId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Products', // Таблица, к которой будет ссылаться колонка
        key: 'id'
      },
      onUpdate: 'CASCADE', // Поведение при обновлении записи в Products
      onDelete: 'CASCADE'  // Поведение при удалении записи в Products
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Reviews', 'productId');
  }
};
