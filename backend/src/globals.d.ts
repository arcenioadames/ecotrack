declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: "ADMIN" | "STAFF";
      };
    }
  }
}

export {};
