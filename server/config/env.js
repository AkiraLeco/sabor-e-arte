import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Procura o .env na raiz do projeto e, depois, em /server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProd = process.env.NODE_ENV === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Defina JWT_SECRET com pelo menos 32 caracteres em produção.');
}

export const env = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurante',
  // Banco local embutido: grava em server/data, sem instalar nem conectar nada externo.
  // Só é desligado explicitamente com USE_LOCAL_DB=false (aí usa MONGODB_URI).
  useLocalDb: process.env.USE_LOCAL_DB !== 'false',
  localDbPath: process.env.LOCAL_DB_PATH ? path.resolve(process.env.LOCAL_DB_PATH) : path.resolve(__dirname, '../data/mongo'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-troque-em-producao-0123456789abcdef',
  jwtExpires: process.env.JWT_EXPIRES_IN || '8h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  whatsapp: (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@restaurante.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456',
  uploadsDir: path.resolve(__dirname, '../uploads'),
};
