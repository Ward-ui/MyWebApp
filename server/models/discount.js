module.exports = (sequelize, DataTypes) => {
  const Discount = sequelize.define('Discount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    code: {  // код сикдки
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  });

  Discount.associate = models => {
  
  }
  return Discount;
};
