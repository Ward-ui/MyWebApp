module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  });

  // Ассоциации моделей
  OrderItem.associate = models => {
    OrderItem.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'Order',  // Используем такой же алиас
        onDelete: 'CASCADE'
    });
    OrderItem.belongsTo(models.Product, { 
      foreignKey: 'productId', 
      as: 'Product',
      onDelete: 'CASCADE'
    });
  };

  return OrderItem;
};
