import { ApiProperty } from "@nestjs/swagger";

export abstract class BaseResponse<T> {
  @ApiProperty({ type: "number", example: 200 })
  statusCode!: number;

  @ApiProperty()
  payload!: T;
}
