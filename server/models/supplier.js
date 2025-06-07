module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Уникальность email
      validate: {
        isEmail: true // Проверка формата email
      }
    },
    Number: {
      type: DataTypes.STRING(15),
      allowNull: false
    }
  });

  Supplier.associate = models => {
  Supplier.hasMany(models.Product, { foreignKey: 'supplierId' });
  }
  return Supplier;
};
