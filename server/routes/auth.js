const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { models } = require("../models");
const User = models.User; // Доступ к модели

const router = express.Router();

// Маршрут для регистрации пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка, что все поля переданы
    if (!username || !password) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Проверка, существует ли уже пользователь с таким именем
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10); // Генерация соли
    const passwordHash = await bcrypt.hash(password, salt); // Хеширование пароля

    // Создание нового пользователя
    const newUser = await User.create({
      username,
      passwordHash, // Сохраняем хеш пароля
      role: 'user' // Роль пользователя
    });

    // Генерация JWT токена для нового пользователя
    const token = jwt.sign(
  { userId: newUser.id, role: newUser.role },
  process.env.JWT_SECRET, 
  { expiresIn: '1h' }
    );


    // Отправка ответа с успешной регистрацией и JWT токеном
    res.status(201).json({ token, role: newUser.role, message: 'Пользователь успешно зарегистрирован' });

  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Сравнение введенного пароля с хешом
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    
    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );


    // Отправка токена и роли пользователя
    res.json({ token, role: user.role });

  } catch (error) {
    console.error("Ошибка при обработке запроса:", error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
