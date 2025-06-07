const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { models, sequelize } = require("../models");
const { Op } = require('sequelize');
const bcrypt = require("bcrypt");

// Подтверждение или отклонение заказа
router.post("/orders/:orderId/confirm", authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Проверяем, что пользователь - администратор
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        // Ищем заказ
        const order = await models.Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        if (status !== "Выполнен" && status !== "Отклонен") {
            return res.status(400).json({ message: "Недопустимый статус" });
        }

        // Обновляем статус
        order.status = status;
        await order.save();

        res.json({ message: `Статус заказа успешно изменен на '${status}'` });
    } catch (error) {
        console.error("Ошибка при изменении статуса заказа:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.post("/create-admin", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: "Все поля обязательны" });
        }

        // Проверка на уникальность username и email
        const existingUser = await models.User.findOne({
            where: {
                [   Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Пользователь с таким именем или email уже существует" });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание администратора
        const admin = await models.User.create({
            username,
            passwordHash: hashedPassword,
            email,
            role: "admin"
        });

        res.status(201).json({ message: "Администратор успешно создан", admin });
    } catch (error) {
        console.error("Ошибка при создании администратора:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
module.exports = router;
