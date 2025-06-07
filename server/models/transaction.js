module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    transactionType: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Transaction.associate = models => {
  Transaction.belongsTo(models.Order, { foreignKey: 'orderId' });
  Transaction.belongsTo(models.User, { foreignKey: 'userId' });
  }
  return Transaction;
};
