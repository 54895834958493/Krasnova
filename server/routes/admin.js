const express = require('express');
const { Order, User } = require('../models');
const router = express.Router();

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    as: 'user', // Указываем alias
                    attributes: ['name', 'surname', 'patronymic'],
                },
            ],
        });

        const orderData = orders.map(order => ({
            id: order.id,
            date: order.date,
            userFullName: order.user
                ? `${order.user.name} ${order.user.surname} ${order.user.patronymic || ''}`.trim()
                : 'Не указано',
            status: order.status || 'Не указан',
            quantity: order.quantity,
        }));

        res.json(orderData);
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        res.status(500).json({ error: 'Ошибка загрузки заказов' });
    }
});

module.exports = router;