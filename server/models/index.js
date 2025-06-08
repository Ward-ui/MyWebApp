const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Подключение к базе данных
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false
});

// Загружаем модели динамически
const models = {};
const modelsPath = path.join(__dirname, '.'); // Путь к папке с моделями

fs.readdirSync(modelsPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js') // Исключаем файл index.js
    .forEach(file => {
        try {
            const model = require(path.join(modelsPath, file))(sequelize, DataTypes);
            models[model.name] = model;
            
        } catch (error) {
            console.error(`Ошибка при загрузке модели ${file}:`, error);
        }
    });

// Связываем модели
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});


// Проверка подключения
sequelize.authenticate()
    .then(() => {
        console.log('Подключение к базе данных успешно!');
    })
    .catch(error => {
        console.error('Ошибка при подключении к базе данных:', error);
    });

module.exports = { sequelize, models };
