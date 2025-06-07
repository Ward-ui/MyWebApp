const express = require('express');
const path = require('path');
const { sequelize } = require('./models/index');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const session = require('express-session');
require('dotenv').config({path: path.join(__dirname, '../.env')});



const app = express();

// ======== Middleware =========
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));



app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Продакшн настройка
}));

// ======== JWT Middleware =========
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен не найден' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Ошибка токена:', err);
            return res.status(403).json({ message: 'Неверный токен' });
        }
        req.user = decoded;
        next();
    });
};


// ======== API Routes =========
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const productRoutes = require('./routes/product');
const paymentRoutes = require('./routes/payment');
const shipmentRoutes = require('./routes/shipment');
const categoryRoutes = require('./routes/category');
const customerRoutes = require('./routes/customer');
const addressRoutes = require('./routes/address');
const reviewRoutes = require('./routes/review');
const cartRoutes = require('./routes/cart');
const orderItemRoutes = require('./routes/orderitem');
const supplierRoutes = require('./routes/supplier');
const stockRoutes = require('./routes/stock');
const transactionRoutes = require('./routes/transaction');
const discountRoutes = require('./routes/discount');
const profileRoutes = require('./routes/profile');
const adminOrdersRouter = require("./routes/adminOrders");
const createAdmin = require("./routes/admin");
const invoiceRoutes = require('./routes/invoice');


// ======== Routes Middleware =========
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin", createAdmin);
app.use('/api/orders', invoiceRoutes);


sequelize.sync({ force: false })
    .then(() => {
        console.log('База данных подключена и синхронизирована');
        app.listen(3000, () => {
            console.log('Сервер запущен на порту 3000');
        });
    })
    .catch((error) => {
        console.error('Ошибка синхронизации базы данных:', error);
    });
