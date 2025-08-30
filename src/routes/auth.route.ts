import express from 'express';
import { AuthController } from '../controllers/auth.controller';

const authRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "password123"
 *       required:
 *         - email
 *         - password
 *     User:
 *       allOf:
 *         - $ref: "#/components/schemas/AuthBody"
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "43101af4-2b31-445e-a406-7393ea66a3bb"
 *             created_at:
 *               type: string
 *               format: date-time
 *               example: "2023-01-01T00:00:00Z"
 */

 /**
 * @swagger
 * /auth/register:
 *   post:
 *     description: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AuthBody"
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "43101af4-2b31-445e-a406-7393ea66a3bb"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Invalid email format"]
 *                     password:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Password must be at least 6 characters long"]
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
authRoutes.post('/register', AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AuthBody"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Invalid email format"]
 *                     password:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Password must be at least 6 characters long"]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
authRoutes.post('/login', AuthController.login);

export { authRoutes };
