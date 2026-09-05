const request = require("supertest");
const app = require("../server");
const db = require("../models");

let token;
let budgetId;

beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  await request(app).post("/api/auth/register").send({
    name: "Budget User",
    email: "budget@test.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "budget@test.com", password: "Password1!" });
  token = res.body.token;
});

afterAll(async () => {
  await db.sequelize.close();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe("Budgets API", () => {
  describe("POST /api/budgets", () => {
    it("should create a budget for a predefined category", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set(auth())
        .send({ category: "groceries", limit: 300 });
      expect(res.status).toBe(201);
      expect(res.body.budget.category).toBe("groceries");
      expect(res.body.budget.isCustomCategory).toBe(false);
      budgetId = res.body.budget.id;
    });

    it("should create a budget for a custom category", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set(auth())
        .send({ category: "pet supplies", limit: 100 });
      expect(res.status).toBe(201);
      expect(res.body.budget.isCustomCategory).toBe(true);
    });

    it("should reject duplicate category budget", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set(auth())
        .send({ category: "groceries", limit: 500 });
      expect(res.status).toBe(409);
    });

    it("should reject negative limit", async () => {
      const res = await request(app)
        .post("/api/budgets")
        .set(auth())
        .send({ category: "dining", limit: -50 });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/budgets", () => {
    it("should return budgets with spending info", async () => {
      const res = await request(app).get("/api/budgets").set(auth());
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("limit");
      expect(res.body[0]).toHaveProperty("spent");
      expect(res.body[0]).toHaveProperty("remaining");
      expect(res.body[0].currency).toBe("USD");
    });
  });

  describe("PATCH /api/budgets/:id", () => {
    it("should update budget limit", async () => {
      const res = await request(app)
        .patch(`/api/budgets/${budgetId}`)
        .set(auth())
        .send({ limit: 400 });
      expect(res.status).toBe(200);
      expect(res.body.budget.limit).toBe(400);
    });
  });

  describe("DELETE /api/budgets/:id", () => {
    it("should delete a budget", async () => {
      const res = await request(app).delete(`/api/budgets/${budgetId}`).set(auth());
      expect(res.status).toBe(200);
    });
  });
});
