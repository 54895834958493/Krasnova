const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Product = require('./Product');

const Order = sequelize.define('Order', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Новый',
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

Order.belongsTo(Product, { foreignKey: 'productId', as: 'OrderProduct' });
module.exports = Order;