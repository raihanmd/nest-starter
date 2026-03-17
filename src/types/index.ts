import { Request } from "express";

export type ReqWithUser = Request & {
  user: {
    id: string;
    role: {
      id: string;
      name: string;
    };
  };
};

export enum EUserRole {
  SUPER_ADMIN = "Super Admin",
  USER = "User",
  ADMIN = "Admin",
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
      }
    }
  }
}
