import { ArgumentsHost, Catch, ExceptionFilter, Global } from "@nestjs/common";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

@Global()
@Catch(ZodError)
export class ValidationFilter<T> implements ExceptionFilter<ZodError> {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = 400;
    response.status(status).json({
      statusCode: status,
      message: fromZodError(exception).toString(),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
