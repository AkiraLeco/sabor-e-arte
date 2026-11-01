import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ensureAdmin, seedIfEmpty, migrateLocalImages } from './services/bootstrap.js';

async function start() {
  await connectDB();
  await ensureAdmin();
  // Na primeira execução do banco local, carrega os dados demonstrativos automaticamente
  if (env.useLocalDb) await seedIfEmpty();
  await migrateLocalImages();

  const server = app.listen(env.port, () => console.log(`🍽️  API em http://localhost:${env.port}/api`));

  const shutdown = async () => {
    server.close();
    await disconnectDB();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err.message);
  if (!env.useLocalDb) {
    console.error('Verifique se o MongoDB está rodando e se MONGODB_URI está correto (ou remova USE_LOCAL_DB=false para usar o banco local).');
  }
  process.exit(1);
});
