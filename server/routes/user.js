const express = require('express');
const router = express.Router();
const { models } = require('../models/index')
const { User } = models;

// Получить всех пользователей
router.get('/', async (req, res) => {
  try {
    const users = await models.User.findAll(); // Метод findAll вызывается на модели User
    if (!users) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получить пользователя по ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать нового пользователя
router.post('/', async (req, res) => {
  try {
    const { username, passwordHash, role } = req.body;
    const user = await User.create({ username, passwordHash, role });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновить информацию о пользователе
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, passwordHash, role } = req.body;
    user.username = username || user.username;
    user.passwordHash = passwordHash || user.passwordHash;
    user.role = role || user.role;
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Удалить пользователя
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
