module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {  // Описание
      type: DataTypes.STRING
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    imageUrl: {
      type: DataTypes.STRING,
      defaultValue: '/uploads/default-image.jpg' // если поле пустое
    }
  });

  Product.associate = models => {
  Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
  Product.hasMany(models.OrderItem, { 
    foreignKey: 'productId',
    as: 'OrderItems',
    onDelete: 'CASCADE'
   });
  }
  return Product;
};
