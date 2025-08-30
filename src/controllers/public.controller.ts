import path from 'node:path';
import type { Request, Response } from 'express';
import YAML from 'yamljs';

export class PublicController {
  static home(req: Request, res: Response) {
    req.log.info('Root endpoint accessed');
    res.json({
      message: 'Welcome to otaQku tasks management API',
    });
  }

  static openapi(_req: Request, res: Response) {
    const swaggerSpec = YAML.load(path.join(process.cwd(), 'docs/swagger.yml'));
    res.json(swaggerSpec);
  }
}
