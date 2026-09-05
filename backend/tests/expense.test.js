const request = require("supertest");
const app = require("../server");
const db = require("../models");

let token;
let expenseId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  // Register and login to get token
  await request(app).post("/api/auth/register").send({
    name: "Expense User",
    email: "expense@test.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "expense@test.com", password: "Password1!" });
  token = res.body.token;
});

afterAll(async () => {
  await db.sequelize.close();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe("Expenses API", () => {
  describe("POST /api/expenses", () => {
    it("should create an expense", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set(auth())
        .send({ amount: 25.5, category: "groceries", date: "2026-09-01", description: "Weekly groceries" });
      expect(res.status).toBe(201);
      expect(res.body.expense.amount).toBe(25.5);
      expect(res.body.expense.currency).toBe("USD");
      expenseId = res.body.expense.id;
    });

    it("should reject negative amount", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set(auth())
        .send({ amount: -10, category: "food", date: "2026-09-01" });
      expect(res.status).toBe(400);
    });

    it("should reject missing fields", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set(auth())
        .send({ amount: 10 });
      expect(res.status).toBe(400);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .send({ amount: 10, category: "food", date: "2026-09-01" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/expenses", () => {
    it("should return user expenses", async () => {
      const res = await request(app).get("/api/expenses").set(auth());
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].currency).toBe("USD");
    });
  });

  describe("DELETE /api/expenses/:id", () => {
    it("should delete an expense", async () => {
      const res = await request(app).delete(`/api/expenses/${expenseId}`).set(auth());
      expect(res.status).toBe(200);
    });

    it("should return 404 for nonexistent expense", async () => {
      const res = await request(app)
        .delete("/api/expenses/00000000-0000-0000-0000-000000000000")
        .set(auth());
      expect(res.status).toBe(404);
    });
  });
});
