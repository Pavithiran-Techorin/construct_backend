import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { logger, requestLogger } from './utils/logger';
import { errorMessages } from './utils/properties';
import apiRoutes from './routes/index';

const app = express();

// ── Session store in PostgreSQL ──────────────────────────────────────────────
const PgSession = connectPgSimple(session);

const sessionStore = new PgSession({
  conString: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
  tableName: 'session',
  createTableIfMissing: false,
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(hpp());
app.use(compression());

// ── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(cors({
  origin: env.FRONTEND_URL.split(','),
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  store: sessionStore,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    domain: 'www.sitepay.online',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 86400000, // 24h
  },
}));

// ── Request Logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #f97316; }',
  customSiteTitle: 'ConstructSite API Docs',
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: errorMessages.ROUTE_NOT_FOUND }));

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ message: errorMessages.INTERNAL_SERVER_ERROR });
});

export default app;
