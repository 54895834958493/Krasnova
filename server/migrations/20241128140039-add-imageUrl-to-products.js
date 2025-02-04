'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Добавляем столбец description
    await queryInterface.addColumn('Products', 'imageUrl','description', {
      type: Sequelize.STRING,
      allowNull: true, // можно использовать true или false в зависимости от ваших требований
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем столбец description
    await queryInterface.removeColumn('Products', 'imageUrl','description');
  }
};