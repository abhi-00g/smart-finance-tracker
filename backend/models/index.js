const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../config/db.config");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.model")(sequelize, DataTypes);
db.Expense = require("./expense.model")(sequelize, DataTypes);
db.Budget = require("./budget.model")(sequelize, DataTypes);

db.User.hasMany(db.Expense, { foreignKey: "userId" });
db.Expense.belongsTo(db.User, { foreignKey: "userId" });

db.User.hasMany(db.Budget, { foreignKey: "userId" });
db.Budget.belongsTo(db.User, { foreignKey: "userId" });

module.exports = db;