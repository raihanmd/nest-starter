import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Next,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { NextFunction } from "express";

@Controller("/v1/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
