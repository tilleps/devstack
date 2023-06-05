import pino from "pino";

// https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/58788706#58788706

declare global {
  namespace Express {
    export interface Request {
      logger?: pino.BaseLogger | undefined;
    }
  }
}
