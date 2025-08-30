import express from 'express';
import { PublicController } from '../controllers/public.controller';

const publicRoutes = express.Router();

publicRoutes.get('/', PublicController.home);
publicRoutes.get('/openapi.json', PublicController.openapi);

export { publicRoutes };
