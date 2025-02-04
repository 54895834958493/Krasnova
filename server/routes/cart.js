const express = require('express');
const Cart = require('../models/Cart');
const router = express.Router();

router.post('/:userId/add', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
      const product = products.find(p => p.id == productId);
      if (!product) {
          return res.status(404).json({ error: 'Товар не найден' });
      }

      const cartItem = await Cart.create({
          userId, 
          productId, 
          quantity,
          name: product.name,
          price: product.price,
          image_url: product.imageUrl,
          category: product.category
      });
      
      res.status(201).json(cartItem);
  } catch (error) {
      res.status(400).json({ error: 'Не удалось добавить товар в корзину' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
      const items = await Cart.findAll({ where: { userId } });
      if (!items) {
          return res.status(404).json({ error: 'Корзина пуста' });
      }

      res.json(items);
  } catch (error) {
      res.status(500).json({ error: 'Не удалось получить корзину' });
  }
});

router.put('/:userId/update', async (req, res) => {
    const { userId } = req.params;
    const { productId, newQuantity } = req.body;
    try {
        const cartItem = await Cart.findOne({ where: { userId, productId } });
        if (cartItem) {
            cartItem.quantity = newQuantity;
            await cartItem.save();
            res.json(cartItem);
        } else {
            res.status(404).json({ error: 'Товар не найден в корзине' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Не удалось обновить товар в корзине' });
    }
});

router.delete('/:userId/remove', async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;
    try {
        const cartItem = await Cart.findOne({ where: { userId, productId } });
        if (cartItem) {
            await cartItem.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Товар не найден в корзине' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Не удалось удалить товар из корзины' });
    }
});