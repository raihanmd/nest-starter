import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { z } from "zod";
import {
  ValidationService,
  FileValidationSchemas,
} from "../validation/validation.service";

describe("ValidationService", () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  describe("validate", () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(18),
    });

    it("should return validated data when data is valid", () => {
      const validData = { name: "John", age: 25 };

      const result = service.validate(testSchema, validData);

      expect(result).toEqual(validData);
    });

    it("should throw ForbiddenException when no data provided", () => {
      expect(() => service.validate(testSchema, null)).toThrow(
        ForbiddenException,
      );
      expect(() => service.validate(testSchema, null)).toThrow(
        "No data provided",
      );
    });

    it("should throw ForbiddenException when data is undefined", () => {
      expect(() => service.validate(testSchema, undefined)).toThrow(
        ForbiddenException,
      );
    });

    it("should throw ZodError when data does not match schema", () => {
      const invalidData = { name: "John", age: 16 };

      expect(() => service.validate(testSchema, invalidData)).toThrow();
    });

    it("should throw error with custom message when name is empty", () => {
      const nameSchema = z.object({
        name: z.string().min(1, "Name is required"),
      });

      expect(() => service.validate(nameSchema, { name: "" })).toThrow();
    });
  });

  describe("validateFileWithSchema", () => {
    const fileSchema = z.object({
      filename: z.string().min(1),
      mimetype: z.string(),
      size: z.number(),
    });

    it("should return file when file is valid", () => {
      const mockFile = {
        originalname: "test.png",
        mimetype: "image/png",
        size: 1024,
        fieldname: "file",
        encoding: "7bit",
        destination: "/tmp",
        path: "/tmp/test.png",
        buffer: Buffer.from(""),
      } as Express.Multer.File;

      const result = service.validateFileWithSchema(mockFile, fileSchema);

      expect(result).toEqual(mockFile);
    });

    it("should return null when file is null", () => {
      const result = service.validateFileWithSchema(null, fileSchema);

      expect(result).toBeNull();
    });

    it("should return null when file is undefined", () => {
      const result = service.validateFileWithSchema(undefined, fileSchema);

      expect(result).toBeNull();
    });

    it("should throw when file does not match schema", () => {
      const mockFile = {
        originalname: "",
        mimetype: "image/png",
        size: 1024,
      } as Express.Multer.File;

      expect(() =>
        service.validateFileWithSchema(mockFile, fileSchema),
      ).toThrow();
    });
  });

  describe("validateFile", () => {
    it("should validate image file with IMAGE schema", () => {
      const mockFile = {
        originalname: "test.png",
        mimetype: "image/png",
        size: 1024,
      } as Express.Multer.File;

      const result = service.validateFile(mockFile, "IMAGE");

      expect(result).toEqual(mockFile);
    });

    it("should return null for null file", () => {
      const result = service.validateFile(null, "IMAGE");

      expect(result).toBeNull();
    });

    it("should return null for undefined file", () => {
      const result = service.validateFile(undefined, "IMAGE");

      expect(result).toBeNull();
    });

    it("should reject file with invalid mimetype", () => {
      const mockFile = {
        originalname: "test.exe",
        mimetype: "application/exe",
        size: 1024,
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile, "IMAGE")).toThrow();
    });

    it("should reject file larger than 5MB for IMAGE type", () => {
      const mockFile = {
        originalname: "large.png",
        mimetype: "image/png",
        size: 6 * 1024 * 1024,
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile, "IMAGE")).toThrow();
    });

    it("should validate ANY file type", () => {
      const mockFile = {
        originalname: "document.pdf",
        mimetype: "application/pdf",
        size: 50 * 1024 * 1024,
      } as Express.Multer.File;

      const result = service.validateFile(mockFile, "ANY");

      expect(result).toEqual(mockFile);
    });

    it("should reject file larger than 100MB for ANY type", () => {
      const mockFile = {
        originalname: "large.zip",
        mimetype: "application/zip",
        size: 101 * 1024 * 1024,
      } as Express.Multer.File;

      expect(() => service.validateFile(mockFile, "ANY")).toThrow();
    });
  });

  describe("validateMultipleFileTypes", () => {
    it("should validate multiple files", () => {
      const files = [
        {
          file: {
            originalname: "a.png",
            mimetype: "image/png",
            size: 100,
          } as Express.Multer.File,
          validationType: "IMAGE" as const,
        },
        {
          file: {
            originalname: "b.pdf",
            mimetype: "application/pdf",
            size: 200,
          } as Express.Multer.File,
          validationType: "ANY" as const,
        },
      ];

      const result = service.validateMultipleFileTypes(files);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
    });

    it("should return null for null input", () => {
      const result = service.validateMultipleFileTypes(null);

      expect(result).toBeNull();
    });

    it("should return null for empty array", () => {
      const result = service.validateMultipleFileTypes([]);

      expect(result).toBeNull();
    });

    it("should handle mixed valid and invalid files", () => {
      const files = [
        {
          file: {
            originalname: "a.png",
            mimetype: "image/png",
            size: 100,
          } as Express.Multer.File,
          validationType: "IMAGE" as const,
        },
        {
          file: {
            originalname: "b.exe",
            mimetype: "application/exe",
            size: 100,
          } as Express.Multer.File,
          validationType: "IMAGE" as const,
        },
      ];

      expect(() => service.validateMultipleFileTypes(files)).toThrow();
    });
  });

  describe("FileValidationSchemas", () => {
    it("should have IMAGE schema defined", () => {
      expect(FileValidationSchemas.IMAGE).toBeDefined();
    });

    it("should have ANY schema defined", () => {
      expect(FileValidationSchemas.ANY).toBeDefined();
    });

    it("IMAGE schema should accept valid image types", () => {
      const validImage = {
        filename: "test.png",
        mimetype: "image/png",
        size: 1024,
      };

      const result = FileValidationSchemas.IMAGE.safeParse(validImage);

      expect(result.success).toBe(true);
    });

    it("IMAGE schema should reject non-image types", () => {
      const invalidImage = {
        filename: "test.pdf",
        mimetype: "application/pdf",
        size: 1024,
      };

      const result = FileValidationSchemas.IMAGE.safeParse(invalidImage);

      expect(result.success).toBe(false);
    });
  });
});
