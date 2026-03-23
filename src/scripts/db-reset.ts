import AppDataSource from '../config/data-source';
import { logger } from '../utils/logger';

if (process.env.NODE_ENV === 'production') {
  logger.error('CRITICAL ERROR: Refusing to run database reset in production environment!');
  process.exit(1);
}

async function resetDatabase() {
  let exitCode = 0;
  try {
    logger.info('Connecting to database for reset...');
    await AppDataSource.initialize();
    logger.info('Database connected.');

    logger.info('Dropping public schema...');
    await AppDataSource.query(`DROP SCHEMA public CASCADE;`);

    logger.info('Recreating public schema...');
    await AppDataSource.query(`CREATE SCHEMA public;`);

    logger.info('Schema reset successfully.');
  } catch (error) {
    logger.error('Error during database reset:', error);
    exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      logger.info('Closing database connection...');
      await AppDataSource.destroy();
    }
    process.exit(exitCode);
  }
}

resetDatabase();
