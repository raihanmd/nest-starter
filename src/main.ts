import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Raihanmd NestAPI Starter")
    .setDescription("Hello world")
    .setVersion("1.0")
    .addBearerAuth({
      description: `Please enter token in here`,
      name: "Authorization",
      type: "http",
      in: "Header",
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/v1", app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();
  await app.listen(app.get(ConfigService).get("SERVER_PORT") ?? 3000);
}
bootstrap();
