import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';
import app from './app';

async function bootstrap() {
  try {
    // Initialize TypeORM
    await AppDataSource.initialize();
    logger.info('✅ PostgreSQL connected via TypeORM');

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running at http://localhost:${env.PORT}`);
      logger.info(`📖 Swagger docs at  http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error: any) {
    logger.error('❌ Failed to start server', { error: error.message });
    process.exit(1);
  }
}

bootstrap();
