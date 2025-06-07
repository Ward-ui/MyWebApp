'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,  // Не допускает пустое значение
      unique: true,      // Если хотите уникальность
      validate: {
        isEmail: true    // Убедитесь, что поле содержит email
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'email');
  }
};

