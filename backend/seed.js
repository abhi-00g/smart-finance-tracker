const bcrypt = require("bcryptjs");
const db = require("./models");
const { User, Expense, Budget } = db;

async function seedData() {
  try {
    await db.sequelize.sync();

    const usersData = [
      {
        name: "Divya Katta",
        email: "divya@gmail.com",
        password: "Divya@123",
        expenses: [
          { amount: 98.46, category: "art supplies", date: "2025-07-02" },
          { amount: 28.61, category: "groceries", date: "2025-06-19" },
          { amount: 12.99, category: "spotify", date: "2025-07-01" },
          { amount: 50, category: "pet care", date: "2025-06-10" }
        ],
        budgets: [
          { category: "subscriptions", limit: 382.24, isCustomCategory: false },
          { category: "pet care", limit: 181.95, isCustomCategory: true },
          { category: "rent", limit: 416.87, isCustomCategory: false },
          { category: "art supplies", limit: 221.94, isCustomCategory: true }
        ]
      },
      {
        name: "Jayashankar Kunchala",
        email: "shanku@gmail.com",
        password: "Shanku@123",
        expenses: [
          { amount: 150, category: "rent", date: "2025-07-01" },
          { amount: 35.5, category: "internet", date: "2025-07-02" },
          { amount: 60, category: "groceries", date: "2025-06-30" },
          { amount: 15.99, category: "netflix", date: "2025-06-29" }
        ],
        budgets: [
          { category: "groceries", limit: 250, isCustomCategory: false },
          { category: "internet", limit: 50, isCustomCategory: true },
          { category: "rent", limit: 500, isCustomCategory: false },
          { category: "netflix", limit: 20, isCustomCategory: true }
        ]
      },
      {
        name: "Nilasha Indukuri",
        email: "nilasha@gmail.com",
        password: "Nilasha@123",
        expenses: [
          { amount: 10, category: "gym", date: "2025-06-28" },
          { amount: 200, category: "rent", date: "2025-07-01" },
          { amount: 25, category: "electricity", date: "2025-06-25" },
          { amount: 70, category: "books", date: "2025-07-03" }
        ],
        budgets: [
          { category: "gym", limit: 50, isCustomCategory: true },
          { category: "rent", limit: 400, isCustomCategory: false },
          { category: "books", limit: 100, isCustomCategory: true },
          { category: "electricity", limit: 60, isCustomCategory: true }
        ]
      },
      {
        name: "Bhanu Palle",
        email: "bhanu@gmail.com",
        password: "Bhanu@123",
        expenses: [
          { amount: 300, category: "travel", date: "2025-07-01" },
          { amount: 80, category: "groceries", date: "2025-06-27" },
          { amount: 120, category: "uber", date: "2025-06-30" },
          { amount: 14.99, category: "disney+", date: "2025-06-29" }
        ],
        budgets: [
          { category: "travel", limit: 500, isCustomCategory: true },
          { category: "groceries", limit: 300, isCustomCategory: false },
          { category: "uber", limit: 150, isCustomCategory: true },
          { category: "disney+", limit: 20, isCustomCategory: true }
        ]
      }
    ];

    // Also update existing user: Abhishek Gade
    const abhishek = await User.findOne({ where: { email: "abhi@gmail.com" } });
    if (abhishek) {
      await Expense.bulkCreate([
        { userId: abhishek.id, amount: 9.99, category: "spotify", date: "2025-07-01" },
        { userId: abhishek.id, amount: 150, category: "electricity", date: "2025-06-25" }
      ]);

      await Budget.bulkCreate([
        { userId: abhishek.id, category: "spotify", limit: 15, isCustomCategory: true },
        { userId: abhishek.id, category: "electricity", limit: 60, isCustomCategory: true }
      ]);
    }

    // Insert new users
    for (const user of usersData) {
      const existing = await User.findOne({ where: { email: user.email } });
      if (existing) continue;

      const hashed = await bcrypt.hash(user.password, 10);
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        password: hashed
      });

      const userId = newUser.id;

      const expenses = user.expenses.map((e) => ({
        userId,
        ...e
      }));

      const budgets = user.budgets.map((b) => ({
        userId,
        ...b
      }));

      await Expense.bulkCreate(expenses);
      await Budget.bulkCreate(budgets);
    }

    console.log("Seeding completed successfully.");
    process.exit();
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
}

seedData();