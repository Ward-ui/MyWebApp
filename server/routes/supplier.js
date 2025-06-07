const express = require('express');
const router = express.Router();
const { models } = require('../models');
const { Supplier } = models;

// Получить всех поставщиков
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать нового поставщика
router.post('/', async (req, res) => {
  try {
    const { name, email, Number } = req.body;
    const supplier = await Supplier.create({ name, email, Number });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
