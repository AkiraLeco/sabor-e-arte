import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { sanitizeInput } from './middlewares/sanitize.js';
import { notFound, errorHandler } from './middlewares/error.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // imagens de /uploads usadas pelo front em outra porta
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameSrc: ['https://www.google.com'],
        connectSrc: ["'self'"],
        // fora de produção (http://localhost) estas diretivas atrapalhariam o desenvolvimento
        upgradeInsecureRequests: env.isProd ? [] : null,
      },
    },
    strictTransportSecurity: env.isProd,
  })
);
app.use(cors({ origin: [env.clientUrl, /^http:\/\/localhost:\d+$/], credentials: false }));
app.use(compression());
if (!env.isProd) app.use(morgan('dev'));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false, message: { erro: 'Muitas requisições. Tente novamente mais tarde.' } }));
app.use(express.json({ limit: '100kb' }));
app.use(sanitizeInput);

app.use('/uploads', express.static(env.uploadsDir, { maxAge: '7d', index: false }));
app.use('/api', routes);
app.use('/api', notFound);

// Em produção, serve o front-end compilado
const dist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.use(notFound);
}

app.use(errorHandler);

export default app;
