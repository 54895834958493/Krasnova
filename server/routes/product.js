const express = require('express');
const router = express.Router();
const { Product, Category } = require('./models/associations');

router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{
                model: Category,
                as: 'category',
                attributes: ['name'],
            }],
        });
        console.log(products);
        res.json(products);
    } catch (error) {
        console.error('Ошибка получения продуктов:', error);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;