import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { AppError, asyncHandler } from '../middlewares/error.js';

export const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const listar = asyncHandler(async (req, res) => {
  const filtro = req.query.todas === 'true' && req.user ? {} : { ativa: true };
  res.json(await Category.find(filtro).sort({ ordem: 1, nome: 1 }));
});

export const criar = asyncHandler(async (req, res) => {
  const ultima = await Category.findOne().sort({ ordem: -1 });
  const cat = await Category.create({ ...req.body, slug: slugify(req.body.nome), ordem: (ultima?.ordem ?? -1) + 1 });
  res.status(201).json(cat);
});

export const atualizar = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(
    req.params.id,
    { ...req.body, slug: slugify(req.body.nome) },
    { new: true, runValidators: true }
  );
  if (!cat) throw new AppError('Categoria não encontrada.', 404);
  res.json(cat);
});

export const excluir = asyncHandler(async (req, res) => {
  const emUso = await Product.countDocuments({ categoria: req.params.id });
  if (emUso > 0) throw new AppError(`Existem ${emUso} produto(s) nesta categoria. Mova ou exclua-os antes.`, 409);
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw new AppError('Categoria não encontrada.', 404);
  res.json({ ok: true });
});

// Recebe a lista de IDs na nova ordem
export const reordenar = asyncHandler(async (req, res) => {
  const ids = req.body.ids;
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) throw new AppError('Lista de categorias inválida.', 400);
  await Category.bulkWrite(ids.map((id, ordem) => ({ updateOne: { filter: { _id: id }, update: { ordem } } })));
  res.json(await Category.find().sort({ ordem: 1 }));
});
