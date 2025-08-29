import express from 'express'
import { PublicController } from '../controllers/public.controller';

const publicRoutes = express.Router()

/**
 * @swagger
 * /:
 *   get:
 *     description: Home endpoint!
 *     responses:
 *       200:
 *         description: Returns welcome message.
 */
publicRoutes.get('/', PublicController.home);

export { publicRoutes }