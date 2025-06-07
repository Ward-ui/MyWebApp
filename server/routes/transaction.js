const express = require('express');
const router = express.Router();
const {  models } = require('../models');
const { Transaction } = models;

// Получить все транзакции
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новую транзакцию
router.post('/', async (req, res) => {
  try {
    const { amount, transactionDate, transactionType, orderId, userId } = req.body;
    const transaction = await Transaction.create({ amount, orderId, transactionDate, transactionType, orderId, userId });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
