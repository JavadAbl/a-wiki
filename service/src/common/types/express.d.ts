// src/types/express.d.ts

import { DecodedToken } from 'src/auth-module/contracts/token-service.contract';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}
