/**
 * Database Seed Script
 * Seeds initial admin user for the construction management system.
 *
 * Run: npm run db:seed
 */
import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import AppDataSource from '../config/data-source';
import { logger } from '../utils/logger';

const ADMIN_USER = {
  firstName: 'Admin',
  lastName: 'User',
  email: process.env.ADMIN_EMAIL || 'admin@constructsite.com',
  password: process.env.ADMIN_SEED_PASSWORD as string,
  role: 'admin',
};

async function seedDatabase() {
  try {
    if (!process.env.ADMIN_SEED_PASSWORD) {
      throw new Error('ADMIN_SEED_PASSWORD environment variable is required');
    }
    logger.info('🌱 Starting database seeding...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ Database connection initialized');
    }

    // Hash the admin password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, saltRounds);
    logger.info('🔐 Password hashed successfully');

    // Insert admin user
    await AppDataSource.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, role;
    `,
      [
        ADMIN_USER.firstName,
        ADMIN_USER.lastName,
        ADMIN_USER.email,
        hashedPassword,
        ADMIN_USER.role,
      ]
    );

    // Check if user exists
    const [user] = await AppDataSource.query(
      `SELECT id, email, role FROM users WHERE email = $1`,
      [ADMIN_USER.email]
    );

    if (user) {
      logger.info('✅ Admin user seeded successfully');
      logger.info(`   📧 Email: ${user.email}`);
      logger.info(`   🔑 Password: (set via ADMIN_SEED_PASSWORD in .env)`);
      logger.info(`   👤 Role: ${user.role}`);
    } else {
      logger.warn('⚠️  Admin user already exists (skipped)');
    }

    logger.info('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the seed
seedDatabase();
