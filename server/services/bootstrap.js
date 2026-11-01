import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';
import { env } from '../config/env.js';
import { slugify } from '../controllers/categoryController.js';
import { categorias, produtos, avaliacoesDemo } from './seedData.js';

// Cria o administrador inicial (apenas desenvolvimento) caso não exista nenhum
export async function ensureAdmin() {
  if (await User.exists({})) return;
  if (env.isProd && env.adminPassword === 'Admin@123456') {
    console.warn('⚠️  Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de criar o administrador em produção.');
    return;
  }
  await User.create({ nome: 'Administrador', email: env.adminEmail, senha: env.adminPassword });
  console.log(`👤 Administrador criado: ${env.adminEmail}`);
  if (!env.isProd) console.log('   (senha de desenvolvimento — altere no .env e no painel antes de publicar)');
}

// Recria categorias, produtos e avaliações demonstrativas. Pedidos e usuários não são tocados.
export async function seedCatalog() {
  await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Review.deleteMany({ demo: true })]);

  const cats = await Category.insertMany(
    categorias.map((c, ordem) => ({ ...c, slug: slugify(c.nome), ordem }))
  );
  const porNome = new Map(cats.map((c) => [c.nome, c._id]));

  const docs = await Product.insertMany(
    produtos.map(({ cat, ...p }) => ({ ...p, categoria: porNome.get(cat) }))
  );

  await Review.insertMany(avaliacoesDemo.map((r) => ({ ...r, aprovada: true, demo: true })));

  const destaque = docs.find((d) => d.nome.startsWith('Salmão'));
  await Settings.findOneAndUpdate(
    { chave: 'principal' },
    { $setOnInsert: { chave: 'principal', whatsapp: env.whatsapp }, $set: { pratoDoDia: destaque._id } },
    { upsert: true }
  );

  return { categorias: cats.length, produtos: docs.length };
}

export async function seedIfEmpty() {
  if ((await Product.countDocuments()) > 0) return;
  const r = await seedCatalog();
  console.log(`🌱 Dados demonstrativos carregados: ${r.categorias} categorias, ${r.produtos} produtos.`);
}

// Converte fotos que apontavam para o Unsplash (bancos criados antes) para os arquivos locais
export async function migrateLocalImages() {
  const antigos = await Product.find({ imagem: /^https:\/\/images\.unsplash\.com\/photo-/ });
  for (const p of antigos) {
    const id = p.imagem.match(/photo-([\w-]+)\?/)?.[1];
    if (id) await Product.updateOne({ _id: p._id }, { imagem: `/images/${id}.jpg` });
  }
  if (antigos.length) console.log(`🖼️  ${antigos.length} foto(s) de produtos migradas para arquivos locais.`);
}
