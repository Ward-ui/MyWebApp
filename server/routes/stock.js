const express = require('express');
const router = express.Router();
const { models } = require('../models');
const { Stock } = models;

// Получить все записи о запасах
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.findAll();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Добавить запись о запасах
router.post('/', async (req, res) => {
  try {
    const { quantity, location, productId } = req.body;
    const stock = await Stock.create({ quantity, location, productId });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
