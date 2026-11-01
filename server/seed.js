// Uso: npm run seed   (recria categorias, produtos e avaliações DEMONSTRATIVAS; pedidos são mantidos)
// Pare a API antes de rodar com o banco local (o banco embutido só aceita um processo por vez).
import { connectDB, disconnectDB } from './config/db.js';
import { ensureAdmin, seedCatalog } from './services/bootstrap.js';

try {
  await connectDB();
  await ensureAdmin();
  const r = await seedCatalog();
  console.log(`🌱 Dados demonstrativos carregados: ${r.categorias} categorias, ${r.produtos} produtos.`);
} catch (err) {
  console.error('Falha no seed:', err.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
