module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false
      }
    });
  
    CartItem.associate = models => {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cartId' });
      CartItem.belongsTo(models.Product, { foreignKey: 'productId' });
    };
  
    return CartItem;
  };
  