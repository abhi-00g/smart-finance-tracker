module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Budget", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      limit: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      isCustomCategory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });
  };