import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userID: string;
        username: string;
      } | JwtPayload | string;
    }
  }
}
