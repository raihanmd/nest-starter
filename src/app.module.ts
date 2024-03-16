import * as winston from "winston";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import "winston-daily-rotate-file";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { PostsModule } from "./posts/posts.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ValidationModule } from "./validation/validation.module";

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
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "10d",
        }),
        new winston.transports.DailyRotateFile({
          level: "error",
          handleExceptions: true,
          handleRejections: true,
          filename: "logs/app-error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "30d",
        }),
      ],
    }),
    PrismaModule,
    ValidationModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
