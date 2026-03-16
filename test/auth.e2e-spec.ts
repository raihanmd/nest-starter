import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module.js";

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix("v1");

    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 30000);

  describe("/v1/auth/login (POST)", () => {
    it("should login with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          username: "admin",
          password: "admin123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("payload");
      expect(response.body.payload).toHaveProperty("token");
      expect(response.body.payload).toHaveProperty("user");

      token = response.body.payload.token;
    });

    it("should return 401 with invalid username", async () => {
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          username: "wronguser",
          password: "admin123",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Username or password wrong");
    });

    it("should return 401 with invalid password", async () => {
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          username: "admin",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Username or password wrong");
    });

    it("should return 400 with missing fields", async () => {
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({
          username: "admin",
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 with empty body", async () => {
      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("/v1/auth/me (GET)", () => {
    it("should return 403 without token", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/auth/me")
        .expect(403);

      expect(response.body).toHaveProperty("message");
    });

    it("should return 403 with invalid token", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body).toHaveProperty("message");
    });

    it("should return user data with valid token", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("payload");
      expect(response.body.payload).toHaveProperty("id");
      expect(response.body.payload).toHaveProperty("username");
      expect(response.body.payload.username).toBe("admin");
      expect(response.body.payload).toHaveProperty("role");
      expect(response.body.payload).not.toHaveProperty("password");
    });
  });

  describe("Protected endpoints", () => {
    it("should return 403 for protected routes without auth", async () => {
      const protectedRoutes = [{ method: "get", path: "/v1/auth/me" }];

      for (const route of protectedRoutes) {
        const res = await request(app.getHttpServer())
          [route.method](route.path)
          .expect(403);

        expect(res.body).toHaveProperty("message");
      }
    });
  });

  describe("Rate limiting", () => {
    it("should include rate limit headers", async () => {
      const response = await request(app.getHttpServer())
        .get("/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.headers).toHaveProperty("x-ratelimit-limit");
      expect(response.headers).toHaveProperty("x-ratelimit-remaining");
    });
  });
});
