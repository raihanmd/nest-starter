import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  InternalServerErrorException,
  Next,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { NextFunction } from "express";
import { ValidationPipe } from "src/validation/validation.pipe";
import { User, UserCreateInputSchema } from "prisma/generated/zod";
import { Logger } from "winston";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

@Controller("/v1/users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Get()
  getUsers(
    @Query("username") username: string,
    @Query("password") password: string,
  ): object {
    try {
      return this.usersService.register({ username, password });
    } catch (err) {
      throw new InternalServerErrorException("Error", "Rada Salah Dikit");
    }
  }

  @Get("/:id")
  getUser(@Param("id", ParseIntPipe) id: number): object {
    return { msg: "Hello World!", id };
  }

  @Post("/login")
  login(@Body(new ValidationPipe(UserCreateInputSchema)) loginReq: User) {
    this.logger.info(`User (${loginReq.username}) logged in`);
  }
}
