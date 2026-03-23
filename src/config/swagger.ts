import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ConstructSite API',
      version: '2.0.0',
      description: 'REST API for Construction Site Attendance & Payments Management (TypeScript + PostgreSQL + TypeORM)',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: {
        sessionAuth: { type: 'apiKey', in: 'cookie', name: 'connect.sid' },
      },
      schemas: {
        Site: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            address: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            emp_id: { type: 'integer' },
            full_name: { type: 'string' },
            nic: { type: 'string' },
            telephone: { type: 'string' },
            per_day_salary: { type: 'number' },
            photo: { type: 'string', nullable: true },
            site_ids: { type: 'array', items: { type: 'integer' } },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            employee_id: { type: 'integer' },
            site_id: { type: 'integer' },
            date: { type: 'string', format: 'date' },
            type: { type: 'string', enum: ['full', 'half', 'absent'] },
            ot_hours: { type: 'number' },
            paid_amount: { type: 'number' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
          },
        },
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
    security: [{ sessionAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
