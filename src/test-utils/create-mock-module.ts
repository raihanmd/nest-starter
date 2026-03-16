import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { DynamicModule, Provider } from "@nestjs/common";

export async function createMockModule(
  imports: DynamicModule[],
  providers: Provider[],
  exports: Provider[] = [],
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    providers,
    exports,
  }).compile();
}

export async function createTestingModuleWithoutImports(
  providers: Provider[],
): Promise<TestingModule> {
  return Test.createTestingModule({
    providers,
  }).compile();
}

export async function createModuleWithOverrides(
  module: unknown,
  overrides: Array<{ provide: unknown; useValue: unknown }>,
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [module as DynamicModule],
  })
    .overrideProvider(overrides[0].provide)
    .useValue(overrides[0].useValue)
    .compile();
}
