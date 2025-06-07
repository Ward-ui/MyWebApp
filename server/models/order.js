module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'в ожидании'
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'не оплачено'
    }
  });

  // Ассоциации моделей
 Order.associate = models => {
  Order.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Order.hasMany(models.OrderItem, {
    foreignKey: 'orderId',
    as: 'OrderItems',
    onDelete: 'CASCADE'
  });
};


  return Order;
};
