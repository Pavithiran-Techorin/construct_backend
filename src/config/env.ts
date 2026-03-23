import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  SESSION_SECRET: string;
  SESSION_MAX_AGE: number;
  SESSION_DOMAIN: string;
  FRONTEND_URL: string;
}

function validateEnv(): EnvConfig {
  const required = ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const sessionSecret = process.env.SESSION_SECRET!;
  if (
    sessionSecret.length < 32 ||
    sessionSecret === 'CHANGE_ME_USE_RANDOM_32_CHARS' ||
    sessionSecret === 'construction_session_secret_dev_2024'
  ) {
    const errorMsg = 'SESSION_SECRET is too weak or using a default placeholder. Please set a unique value in your .env file (must be at least 32 characters).';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`CRITICAL: ${errorMsg}`);
    } else {
      console.warn(`\n⚠️  SECURITY WARNING: ${errorMsg}\n`);
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000'),
    POSTGRES_HOST: process.env.POSTGRES_HOST!,
    POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432'),
    POSTGRES_DB: process.env.POSTGRES_DB!,
    POSTGRES_USER: process.env.POSTGRES_USER!,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400000'),
    SESSION_DOMAIN: process.env.SESSION_DOMAIN || 'localhost',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  };
}

export const env = validateEnv();
