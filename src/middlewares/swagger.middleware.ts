import path from 'path'
import swaggerJSDoc, { type Options } from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import pkg from '../../package.json'

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: pkg.name || 'API Documentation',
      version: pkg.version || '1.0.0',
      description: pkg.description || 'Backend Engineer Technical Test',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://otaqku-technical-test.hawari.dev',
        description: 'Production server',
      }
    ],
  },
  // Point to source files during development, compiled files in production
  apis: process.env.NODE_ENV === 'production'
    ? [path.join(process.cwd(), 'dist/routes/*.js')]
    : [path.join(process.cwd(), 'src/routes/*.ts')],
}

// Export the json spec
export const swaggerSpec = swaggerJSDoc(options)

// Export the standard swagger middleware (recommended approach)
export const swaggerServe = swaggerUi.serve
export const swaggerSetup = swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: pkg.name || 'API Documentation',
})