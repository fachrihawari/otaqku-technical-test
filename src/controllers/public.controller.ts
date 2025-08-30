import type { Request, Response } from 'express';
import { PublicService } from '../services/public.service';

export class PublicController {
  static home(req: Request, res: Response) {
    req.log.info('Root endpoint accessed');
    res.json({ message: 'Welcome to otaQku tasks management API' });
  }

  static async openapi(_req: Request, res: Response) {
    const openApiSpec = await PublicService.openAPI();
    res.json(openApiSpec);
  }
}
