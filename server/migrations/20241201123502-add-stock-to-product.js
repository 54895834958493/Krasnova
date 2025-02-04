'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Products', 'stock', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Products', 'stock', {
            type: Sequelize.INTEGER,
            allowNull: false,
        });
    },
};
