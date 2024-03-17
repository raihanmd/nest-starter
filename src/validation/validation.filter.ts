import { ArgumentsHost, Catch, ExceptionFilter, Global } from "@nestjs/common";
import { Response } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

@Global()
@Catch(ZodError)
export class ValidationFilter implements ExceptionFilter<ZodError> {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 400;
    response.status(status).json({
      message: fromZodError(exception).toString(),
      statusCode: status,
    });
  }
}
