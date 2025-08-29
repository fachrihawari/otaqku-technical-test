import type { Request, Response } from 'express';

export class PublicController {
  static home(req: Request, res: Response) {
    req.log.info('Root endpoint accessed');
    res.json({
      message: 'Welcome to otaQku tasks management API',
    });
  }
}
