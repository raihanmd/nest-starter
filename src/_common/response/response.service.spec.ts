import { Test, TestingModule } from "@nestjs/testing";
import { ResponseService } from "../response/response.service";

describe("ResponseService", () => {
  let service: ResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseService],
    }).compile();

    service = module.get<ResponseService>(ResponseService);
  });

  describe("success", () => {
    it("should return payload in correct format", () => {
      const payload = { id: "1", name: "Test" };

      const result = service.success(payload);

      expect(result).toHaveProperty("payload");
      expect(result.payload).toEqual(payload);
    });

    it("should handle string payload", () => {
      const payload = "Success message";

      const result = service.success(payload);

      expect(result.payload).toBe(payload);
    });

    it("should handle array payload", () => {
      const payload = [1, 2, 3, 4, 5];

      const result = service.success(payload);

      expect(result.payload).toEqual(payload);
    });

    it("should handle empty object payload", () => {
      const payload = {};

      const result = service.success(payload);

      expect(result.payload).toEqual({});
    });

    it("should handle null payload", () => {
      const payload = null;

      const result = service.success(payload);

      expect(result.payload).toBeNull();
    });

    it("should handle nested object payload", () => {
      const payload = {
        user: {
          id: "1",
          profile: {
            name: "John",
            age: 30,
          },
        },
      };

      const result = service.success(payload);

      expect(result.payload).toEqual(payload);
    });
  });

  describe("pagination", () => {
    it("should return payload and meta in correct format", () => {
      const payload = [{ id: "1" }, { id: "2" }];
      const meta = { total: 2, page: 1, limit: 10 };

      const result = service.pagination(payload, meta);

      expect(result).toHaveProperty("payload");
      expect(result).toHaveProperty("meta");
      expect(result.payload).toEqual(payload);
      expect(result.meta).toEqual(meta);
    });

    it("should handle empty payload with meta", () => {
      const payload: unknown[] = [];
      const meta = { total: 0, page: 1, limit: 10 };

      const result = service.pagination(payload, meta);

      expect(result.payload).toEqual([]);
      expect(result.meta).toEqual(meta);
    });

    it("should handle different meta structures", () => {
      const payload = [{ id: "1" }];
      const meta = { nextCursor: "abc123", hasMore: false };

      const result = service.pagination(payload, meta);

      expect(result.meta).toEqual(meta);
    });

    it("should handle numeric meta", () => {
      const payload = [1, 2, 3];
      const meta = 3;

      const result = service.pagination(payload, meta);

      expect(result.meta).toBe(3);
    });
  });
});
