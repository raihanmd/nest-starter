import * as winston from "winston";
import { ConfigModule } from "@nestjs/config";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import "winston-daily-rotate-file";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthMiddleware } from "./auth/auth.middleware";
import { ValidationService } from "./validation/validation.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.combine(
          winston.format.ms(),
          winston.format.timestamp({
            format: "DD/MM/YYYY dddd HH:mm:ss",
          }),
          winston.format.printf(
            (info) =>
              `${info.timestamp} - [${info.level}] : ${info.message} ${info.ms || ""}`,
          ),
        ),
      ),
      level: "debug",
      transports: [
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
        new winston.transports.DailyRotateFile({
          filename: "logs/app-%DATE%.log",
          datePattern: "DD-MM-YYYY",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "10d",
        }),
        new winston.transports.DailyRotateFile({
          level: "error",
          filename: "logs/app-error-%DATE%.log",
          datePattern: "DD-MM-YYYY",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "30d",
        }),
      ],
    }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, ValidationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("/v1/users/arsip-negara");
  }
}
