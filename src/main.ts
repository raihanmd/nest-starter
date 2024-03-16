import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AppModule } from "./app.module";
import { ValidationFilter } from "./validation/validation.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalFilters(new ValidationFilter());
  await app.listen(app.get(ConfigService).get("SERVER_PORT") ?? 3000);
}
bootstrap();
