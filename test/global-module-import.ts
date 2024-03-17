import * as winston from "winston";
import { WinstonModule } from "nest-winston";
import { PrismaModule } from "src/prisma/prisma.module";

const GlobalModuleImport = [
  PrismaModule,
  WinstonModule.forRoot({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
    ),
    transports: [new winston.transports.Console()],
  }),
];

export default GlobalModuleImport;
