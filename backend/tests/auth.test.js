const request = require("supertest");
const app = require("../server");
const db = require("../models");

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Auth API", () => {
  const validUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Password1!",
    confirmPassword: "Password1!",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/registered/i);
    });

    it("should reject duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);
      expect(res.status).toBe(409);
    });

    it("should reject weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "weak@test.com", password: "weak", confirmPassword: "weak" });
      expect(res.status).toBe(400);
    });

    it("should reject mismatched passwords", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "mm@test.com", confirmPassword: "Different1!" });
      expect(res.status).toBe(400);
    });

    it("should reject missing fields", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "no@test.com" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
    });

    it("should reject wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "WrongPass1!" });
      expect(res.status).toBe(401);
    });

    it("should reject nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@test.com", password: "Password1!" });
      expect(res.status).toBe(404);
    });
  });
});
