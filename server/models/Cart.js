const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Cart = sequelize.define('Cart', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bouquetName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    flowers: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

Cart.belongsTo(User, { foreignKey: 'userId' });
module.exports = Cart;