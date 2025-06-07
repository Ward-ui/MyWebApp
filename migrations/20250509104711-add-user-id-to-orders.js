'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Проверка на существование столбца
    const hasColumn = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `Orders` LIKE 'userId';"
    );

    if (hasColumn[0].length === 0) {
      return queryInterface.addColumn('Orders', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Orders', 'userId');
  },
};
