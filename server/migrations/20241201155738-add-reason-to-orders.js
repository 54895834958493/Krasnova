'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Orders', 'reason', {
            type: Sequelize.STRING,
            allowNull: true, // Reason может быть пустым
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Orders', 'reason');
    }
};