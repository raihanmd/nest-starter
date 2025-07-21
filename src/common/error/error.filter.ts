import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { Response } from "express";
import { LoggingService } from "../logging/logging.service";

@Catch(ZodError, Prisma.PrismaClientKnownRequestError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.initiate("ErrorFilter");
  }

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    this.loggingService.error(exception);

    switch (true) {
      case exception instanceof ZodError:
        response.status(400).json({
          // @ts-ignore
          message: fromZodError(exception).toString(),
          error: "Validation error",
        });
        break;
      case exception instanceof Prisma.PrismaClientKnownRequestError:
        this.handlePrismaError(exception, response);
        break;
      case exception instanceof HttpException:
        response.status(exception.getStatus()).json({
          message: exception.message || exception.getResponse(),
          error: exception.name,
        });
        break;
      default:
        response.status(exception.statusCode || 500).json({
          message: exception.message,
          error: "Internal server error",
        });
    }
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ) {
    const prismaErrorResponseMap = {
      P2002: {
        message:
          "There is a unique constraint violation, a new row cannot be created in the database.",
        error: "Database error",
      },
      P2003: {
        message:
          "Cannot delete or update a parent row: a foreign key constraint fails.",
        error: "Database error",
      },
    };

    const errorResponse = prismaErrorResponseMap[exception.code] || {
      message: exception.message,
      error: "Internal Server Error",
    };

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
