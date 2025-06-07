const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET; // Лучше хранить в .env

// Хеширование пароля
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Проверка пароля
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Создание токена
const generateToken = (user) => {
  return jwt.sign({ id: user.userId, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
};

// Проверка токена
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = { hashPassword, comparePassword, generateToken, verifyToken };
