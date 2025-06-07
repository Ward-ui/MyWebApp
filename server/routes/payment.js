const express = require('express');
const router = express.Router();
const {  models } = require('../models');
const { Payment } = models;

// Получить все платежи
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новый платеж
router.post('/', async (req, res) => {
  try {
    const { paymentDate, amount, paymentMethod, orderId } = req.body;
    const payment = await Payment.create({ paymentDate, amount, paymentMethod, orderId });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
