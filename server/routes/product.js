const express = require('express');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const { models } = require('../models');
const { Product, Category } = models;
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, File, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, File, cb) => {
    cb(null, Date.now() + path.extname(File.originalname));
  },
});

const upload = multer({ storage: storage});

router.put("/:id/replenish", authMiddleware, adminMiddleware, async (req, res) => {
  const productId = req.params.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Некорректное количество" });
  }

  try {
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Продукт не найден" });

    product.stockQuantity += amount;
    await product.save();

    res.json({ message: "Запас обновлен", newStock: product.stockQuantity });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
});

// Получить все товары
router.get("/", async (req, res) => {
    try {
        const { categoryId } = req.query;
        const filter = {};

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        const products = await Product.findAll({
            where: filter,
            include: [{ model: Category, attributes: ["name"] }],
        });

        res.json(products);
    } catch (error) {
        console.error("Ошибка при получении продуктов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение всех категорий
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Создать новый товар
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stockQuantity, categoryId } = req.body;
    
    // Проверка наличия обязательных данных
    if (!name || !price || !stockQuantity || !categoryId) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения!' });
    }

    // Создание нового товара
    const newProduct = await Product.create({ name, description, price, stockQuantity, categoryId });
    res.status(201).json(newProduct); // Возвращаем созданный товар
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(500).json({ message: 'Ошибка при добавлении товара', error: error.message });
  }
});

// Пример обработки добавления продукта с дополнительными логами
router.post('/add', upload.single('image'),async (req, res) => {
  try {
    
    const { name, description, price, stockQuantity, categoryId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-image.jpg';


    // Проверка наличия обязательных данных
    if (!name || !price || !stockQuantity || !categoryId) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения!' });
    }

    // Добавление нового продукта в базу данных
    const newProduct = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      categoryId,
      imageUrl,
    });

    res.status(201).json(newProduct); // Возвращаем созданный продукт
  } catch (error) {
    console.error('Ошибка при добавлении продукта:', error);
    res.status(500).json({ message: 'Ошибка при добавлении продукта', error: error.message });
  }
});




module.exports = router;
