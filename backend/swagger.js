module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Crop Advisory System API',
    version: '1.0.0',
    description: 'Swagger documentation for the Crop Advisory backend API',
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local development server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          phone: { type: 'string' },
          district: { type: 'string' },
          ward: { type: 'string' },
          farmName: { type: 'string' },
          farmSize: { type: 'string' },
        },
        required: ['fullName', 'email', 'password', 'phone', 'district', 'ward'],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          token: { type: 'string' },
          user: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register farmer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Users returned' },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/advisories': {
      get: { tags: ['Advisories'], summary: 'Get all advisories', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Advisories'], summary: 'Create advisory', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' }, '403': { description: 'Forbidden' } } },
    },
    '/api/advisories/{id}': {
      get: { tags: ['Advisories'], summary: 'Get advisory by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['Advisories'], summary: 'Update advisory', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Advisories'], summary: 'Delete advisory', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/api/diseases': {
      get: { tags: ['Diseases'], summary: 'List diseases', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Diseases'], summary: 'Create disease', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/api/diseases/identify': {
      post: { tags: ['Diseases'], summary: 'Identify disease', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/diseases/{id}': {
      get: { tags: ['Diseases'], summary: 'Get disease', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['Diseases'], summary: 'Update disease', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Diseases'], summary: 'Delete disease', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/api/records': {
      get: { tags: ['Records'], summary: 'List records', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Records'], summary: 'Create record', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/api/records/summary': {
      get: { tags: ['Records'], summary: 'Get record summary', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/records/{id}': {
      get: { tags: ['Records'], summary: 'Get record', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['Records'], summary: 'Update record', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Records'], summary: 'Delete record', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/api/notifications': {
      get: { tags: ['Notifications'], summary: 'List notifications', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Notifications'], summary: 'Create notification', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/api/notifications/{id}': {
      delete: { tags: ['Notifications'], summary: 'Delete notification', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/api/reports/admin': {
      get: { tags: ['Reports'], summary: 'Get admin report', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/reports/farmer': {
      get: { tags: ['Reports'], summary: 'Get farmer report', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/knowledge': {
      get: { tags: ['Knowledge'], summary: 'List knowledge articles', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Knowledge'], summary: 'Create knowledge article', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Created' } } },
    },
    '/api/knowledge/{id}': {
      get: { tags: ['Knowledge'], summary: 'Get knowledge article', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['Knowledge'], summary: 'Update knowledge article', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Knowledge'], summary: 'Delete knowledge article', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } },
    },
    '/api/users/{id}': {
      get: { tags: ['Users'], summary: 'Get user by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
      put: { tags: ['Users'], summary: 'Update user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
    },
    '/api/users/{id}/suspend': {
      put: { tags: ['Users'], summary: 'Suspend user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Suspended' } } },
    },
    '/api/users/{id}/activate': {
      put: { tags: ['Users'], summary: 'Activate user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Activated' } } },
    },
  },
};
