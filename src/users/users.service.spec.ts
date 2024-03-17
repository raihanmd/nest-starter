import { Test, TestingModule } from "@nestjs/testing";

import { UsersService } from "./users.service";
import GlobalModuleImport from "test/global-module-import";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...GlobalModuleImport],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
