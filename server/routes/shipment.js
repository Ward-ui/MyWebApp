const express = require('express');
const router = express.Router();
const { models } = require('../models');
const { Shipment } = models;

// Получить все отправки
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.findAll();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новую отправку
router.post('/', async (req, res) => {
  try {
    const { shipmentDate, trackingNumber, status, orderId } = req.body;
    const shipment = await Shipment.create({ shipmentDate, trackingNumber, status, orderId });
    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
