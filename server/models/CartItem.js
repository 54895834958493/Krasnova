const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Product = require('./Product');


const CartItem = sequelize.define('CartItem', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'CartProduct' });
module.exports = CartItem;