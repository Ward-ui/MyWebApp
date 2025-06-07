module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false,
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: { isEmail: true },
    },
    phone: { 
      type: DataTypes.STRING, 
      allowNull: false,
    },
    address: { type: DataTypes.STRING, 
      allowNull: false,
    }
  });

  Customer.associate = models => {
  Customer.belongsTo(models.User, { foreignKey: 'userId' }); // обратная связь
  Customer.hasMany(models.Address, { foreignKey: 'customerId' });
};

  return Customer;
};
