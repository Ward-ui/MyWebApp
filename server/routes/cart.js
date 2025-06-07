const express = require('express');
const router = express.Router();
const { models } = require('../models');
const { Product, CartItem, Cart } = models;
const { authMiddleware } = require('../middleware/authMiddleware');

// Получить корзину пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({
      where: { userId },
      include: {
        model: CartItem,
        include: [Product],
      },
    });

    if (!cart) {
      return res.json({ cart: [] });
    }

    const items = cart.CartItems.map(item => ({
      productId: item.productId,
      name: item.Product.name,
      price: item.Product.price,
      quantity: item.quantity,
      imageUrl: item.Product.imageUrl,
    }));

    res.status(200).json({ cart: items });
  } catch (error) {
    console.error('Ошибка при получении корзины:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить товар в корзину
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId и quantity обязательны' });
    }

    const product = await Product.findByPk(productId);

    if (!product || product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Недостаточно товара на складе' });
    }

    let cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });
    }

    // Уменьшаем количество товара на складе
    product.stockQuantity -= quantity;
    await product.save();

    res.status(200).json({ message: 'Товар добавлен в корзину' });
  } catch (error) {
    console.error('Ошибка при добавлении товара в корзину:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Очистка корзины
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ where: { userId }, include: [CartItem] });

    if (!cart) {
      return res.status(400).json({ message: 'Корзина пуста' });
    }

    for (const item of cart.CartItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();
      }
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.status(200).json({ message: 'Корзина очищена' });
  } catch (error) {
    console.error('Ошибка при очистке корзины:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
