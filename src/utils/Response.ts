export class Response {
  payload: any;
  statusCode: number;

  constructor(payload: any, statusCode: number) {
    this.payload = payload;
    this.statusCode = statusCode;

    return {
      payload,
      statusCode,
    };
  }
}