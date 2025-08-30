// biome-ignore lint/correctness/noUnusedImports: We need this to inject the types into Express
import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
      };
    }
  }
}
