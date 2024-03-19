import { UserOptionalDefaultsSchema } from "prisma/zod";
import { ValidationPipe } from "./validation.pipe";

describe("ValidationPipe", () => {
  it("should be defined", () => {
    expect(new ValidationPipe(UserOptionalDefaultsSchema)).toBeDefined();
  });
});
