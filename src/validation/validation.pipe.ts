import { Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private zodType: ZodType) {}

  transform(value: any) {
    return this.zodType.parse(value);
  }
}
