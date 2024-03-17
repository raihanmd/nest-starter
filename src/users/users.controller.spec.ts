import { Test, TestingModule } from "@nestjs/testing";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import GlobalModuleImport from "test/global-module-import";

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...GlobalModuleImport],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be return data", () => {
    expect(controller).toBeDefined();
  });
});
