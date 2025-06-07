const express = require('express');
const router = express.Router();
const { models } = require('../models/index')
const { Discount } = models;
// Получить все скидки
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.findAll();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Добавить новую скидку
router.post('/', async (req, res) => {
  try {
    const { percentage, code } = req.body;
    const discount = await Discount.create({ percentage, code });
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
