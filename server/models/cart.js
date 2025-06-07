module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    }
  });

  Cart.associate = models => {
    Cart.belongsTo(models.User, { foreignKey: 'userId' });
    Cart.hasMany(models.CartItem, { foreignKey: 'cartId' });
    module.exports = (sequelize, DataTypes) => {
      const Cart = sequelize.define('Cart', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: 'active'
        }
      });
    
      Cart.associate = models => {
        Cart.belongsTo(models.User, { foreignKey: 'userId' });
        Cart.hasMany(models.CartItem, { foreignKey: 'cartId' });
        Cart.hasOne(models.Order, { foreignKey: 'cartId' }); // Если корзина может быть преобразована в заказ
      };
    
      return Cart;
    };
    
  };

  return Cart;
};
