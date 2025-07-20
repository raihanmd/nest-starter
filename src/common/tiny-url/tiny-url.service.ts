import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LoggingService } from "../logging/logging.service";

@Injectable()
export class TinyUrlService {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {}

  private readonly HOTSNAME = this.configService.get("TINY_URL_HOSTNAME");
  private readonly API_KEY = this.configService.get("TINY_URL_API_KEY");

  async shortener(url: string) {
    try {
      const res = await fetch(
        `https://${this.HOTSNAME}/create?api_token=${this.API_KEY}&url=${url}`,
        {
          method: "POST",
          body: JSON.stringify({
            url,
            domain: "tinyurl.com",
          }),
        },
      );

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      return ((await res.json())?.data?.tiny_url as string) ?? "";
    } catch (error) {
      this.loggingService.error(error);
    }
  }
}
