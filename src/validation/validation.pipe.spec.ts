import { UserWhereInputSchema } from "prisma/generated/zod";
import { ValidationPipe } from "./validation.pipe";

describe("ValidationPipe", () => {
  it("should be defined", () => {
    expect(new ValidationPipe(UserWhereInputSchema)).toBeDefined();
  });
});
