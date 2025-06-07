const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { models } = require("../models");
const { Order, User, Customer, OrderItem, Product } = models;

// Маршрут для создания накладной
router.get("/:orderId/invoice", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Получаем заказ с вложениями
    const order = await Order.findByPk(orderId, {
  include: [
    {
      model: User,
      include: [Customer],
    },
    {
      model: OrderItem,
      as: "OrderItems",
      include: [
        {
          model: Product,
          as: "Product",  // <--- Обязательно укажите алиас здесь!
        },
      ],
    },
  ],
});


    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    const user = order.User;
    const customer = user.Customer || {};

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // Регистрируем шрифты
    const fontPathRegular = path.join(__dirname, "..", "fonts", "DejaVuSans.ttf");
    const fontPathBold = path.join(__dirname, "..", "fonts", "DejaVuSans-Bold.ttf");
    doc.registerFont("DejaVuSans", fontPathRegular);
    doc.registerFont("DejaVuSans-Bold", fontPathBold);

    res.setHeader("Content-Disposition", `attachment; filename=invoice_order_${order.id}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Заголовок
    doc.font("DejaVuSans-Bold").fontSize(20).text(`Расходная накладная №${order.id} от ${order.createdAt.toLocaleDateString()}`, {
      align: "center",
    });
    doc.moveDown(1.5);

    // Данные поставщика и покупателя
    doc.font("DejaVuSans").fontSize(12);
    doc.text(`Поставщик: ООО 'Поставщик СельхозПродукции'`);
    doc.text(`Покупатель: ${customer.name || user.fullName || "Неизвестный клиент"}`);
    doc.text(`Телефон: ${customer.phone || user.phone || "Нет данных"}`);
    doc.text(`Email: ${customer.email || user.email || "Нет данных"}`);
    doc.text(`Адрес: ${customer.address || user.address || "Нет данных"}`);
    doc.moveDown(1);

    // Таблица товаров - заголовки
    const tableTop = doc.y;
    const itemX = 40;

    const colWidths = {
      npp: 40,
      code: 40,
      name: 150,
      qty: 50,
      unit: 40,
      price: 70,
      sum: 70,
    };

    doc.font("DejaVuSans-Bold");
    doc.text("НПП", itemX, tableTop, { width: colWidths.npp, align: "left" });
    doc.text("Код", itemX + colWidths.npp, tableTop, { width: colWidths.code, align: "left" });
    doc.text("Товар", itemX + colWidths.npp + colWidths.code, tableTop, { width: colWidths.name, align: "left" });
    doc.text("Кол-во", itemX + colWidths.npp + colWidths.code + colWidths.name, tableTop, { width: colWidths.qty, align: "right" });
    doc.text("Ед.", itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty, tableTop, { width: colWidths.unit, align: "center" });
    doc.text("Цена", itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty + colWidths.unit, tableTop, { width: colWidths.price, align: "right" });
    doc.text("Сумма", itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty + colWidths.unit + colWidths.price, tableTop, { width: colWidths.sum, align: "right" });

    doc.moveDown(0.5);
    doc.font("DejaVuSans");

    // Горизонтальная линия под заголовками
    doc.moveTo(itemX, doc.y).lineTo(itemX + Object.values(colWidths).reduce((a, b) => a + b, 0), doc.y).stroke();

    let positionY = doc.y + 5;
    let total = 0;

    order.OrderItems.forEach((item, index) => {
      const amount = item.quantity * item.Product.price;
      total += amount;

      doc.text(String(index + 1), itemX, positionY, { width: colWidths.npp, align: "left" });
      doc.text(String(item.Product.id), itemX + colWidths.npp, positionY, { width: colWidths.code, align: "left" });
      doc.text(item.Product.name, itemX + colWidths.npp + colWidths.code, positionY, { width: colWidths.name, align: "left" });
      doc.text(String(item.quantity), itemX + colWidths.npp + colWidths.code + colWidths.name, positionY, { width: colWidths.qty, align: "right" });
      doc.text(item.Product.unit || "шт", itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty, positionY, { width: colWidths.unit, align: "center" });
      doc.text(`${item.Product.price.toFixed(2)} ₽`, itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty + colWidths.unit, positionY, { width: colWidths.price, align: "right" });
      doc.text(`${amount.toFixed(2)} ₽`, itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty + colWidths.unit + colWidths.price, positionY, { width: colWidths.sum, align: "right" });

      positionY += 20;
    });

    // Линия перед итогом
    doc.moveTo(itemX, positionY).lineTo(itemX + Object.values(colWidths).reduce((a, b) => a + b, 0), positionY).stroke();

    // Итоговая сумма
    positionY += 10;
    doc.font("DejaVuSans-Bold").text(`Итого: ${total.toFixed(2)} ₽`, itemX + colWidths.npp + colWidths.code + colWidths.name + colWidths.qty + colWidths.unit + colWidths.price - 10, positionY, {
      width: colWidths.sum + 10,
      align: "right",
    });

    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error("Ошибка при создании накладной:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
