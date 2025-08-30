// biome-ignore lint/correctness/noUnusedImports: We need this to inject the types into Express
import express from 'express';
import type { Task, User } from './db/schema';

declare global {
  namespace Express {
    interface Request {
      user: User;
      task: Task;
    }
  }
}
