const express = require('express');
const router = express.Router();
const { models } = require('../models');
const { Review } = models;

// Получить все отзывы
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новый отзыв
router.post('/', async (req, res) => {
  try {
    const { rating, comment, productId} = req.body;
    const review = await Review.create({ rating, comment, productId });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
