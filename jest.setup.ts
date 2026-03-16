import "jest-extended";
import { jest } from "@jest/globals";

expect.extend({
  toBeOneOf(received: unknown, expected: unknown[]) {
    if (Array.isArray(expected) && expected.includes(received)) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be one of ${expected}`,
      pass: false,
    };
  },
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});
