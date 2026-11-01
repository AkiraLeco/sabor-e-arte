import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';
import { AppError, asyncHandler } from '../middlewares/error.js';

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Lista com filtros: categoria (id ou slug), q, promocao, maisVendidos, ordem
export const listar = asyncHandler(async (req, res) => {
  const { categoria, q, promocao, maisVendidos, ordem } = req.query;
  const filtro = {};

  if (categoria) {
    const cat = /^[a-f\d]{24}$/i.test(categoria)
      ? await Category.findById(categoria)
      : await Category.findOne({ slug: String(categoria) });
    if (!cat) return res.json([]);
    filtro.categoria = cat._id;
  }

  let produtos = await Product.find(filtro).populate('categoria', 'nome slug ativa ordem');
  produtos = produtos.filter((p) => p.categoria?.ativa);

  if (q) {
    const termo = norm(q).slice(0, 60);
    produtos = produtos.filter((p) => norm(`${p.nome} ${p.descricao}`).includes(termo));
  }
  if (promocao === 'true') produtos = produtos.filter((p) => p.promocaoVigente);

  if (maisVendidos === 'true') {
    produtos = produtos.filter((p) => p.vendas > 0).sort((a, b) => b.vendas - a.vendas).slice(0, 12);
  } else if (ordem === 'menor_preco') {
    produtos.sort((a, b) => a.precoAtual() - b.precoAtual());
  } else if (ordem === 'maior_preco') {
    produtos.sort((a, b) => b.precoAtual() - a.precoAtual());
  } else {
    produtos.sort((a, b) => a.categoria.ordem - b.categoria.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  res.json(produtos);
});

export const obter = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('categoria', 'nome slug');
  if (!p) throw new AppError('Produto não encontrado.', 404);
  res.json(p);
});

async function garantirCategoria(id) {
  if (!(await Category.exists({ _id: id }))) throw new AppError('Categoria inexistente.', 400);
}

export const criar = asyncHandler(async (req, res) => {
  await garantirCategoria(req.body.categoria);
  const p = await Product.create(req.body);
  res.status(201).json(await p.populate('categoria', 'nome slug'));
});

export const atualizar = asyncHandler(async (req, res) => {
  await garantirCategoria(req.body.categoria);
  const p = await Product.findById(req.params.id);
  if (!p) throw new AppError('Produto não encontrado.', 404);
  p.set(req.body);
  await p.save();
  res.json(await p.populate('categoria', 'nome slug'));
});

export const excluir = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw new AppError('Produto não encontrado.', 404);
  await Settings.updateOne({ pratoDoDia: p._id }, { pratoDoDia: null });
  res.json({ ok: true });
});

// Alterna rapidamente disponibilidade (usado na tabela do painel)
export const alternarDisponibilidade = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw new AppError('Produto não encontrado.', 404);
  p.disponivel = !p.disponivel;
  await p.save();
  res.json(p);
});
