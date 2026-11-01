import Message from '../models/Message.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import { asyncHandler, AppError } from '../middlewares/error.js';
import { getSettings, toPublic } from '../services/settingsService.js';

export const obterConfiguracoes = asyncHandler(async (_req, res) => {
  const s = await getSettings();
  const pub = toPublic(s);
  if (s.pratoDoDia) pub.pratoDoDiaProduto = await Product.findById(s.pratoDoDia).populate('categoria', 'nome slug');
  res.json(pub);
});

export const atualizarConfiguracoes = asyncHandler(async (req, res) => {
  const atual = await getSettings();
  if (req.body.pratoDoDia && !(await Product.exists({ _id: req.body.pratoDoDia }))) {
    throw new AppError('Prato do dia inexistente.', 400);
  }
  atual.set(req.body);
  await atual.save();
  res.json(toPublic(await Settings.findById(atual._id)));
});

export const enviarContato = asyncHandler(async (req, res) => {
  await Message.create(req.body);
  res.status(201).json({ ok: true, mensagem: 'Mensagem enviada! Retornaremos em breve.' });
});

export const listarAvaliacoes = asyncHandler(async (_req, res) => {
  res.json(await Review.find({ aprovada: true }).sort({ createdAt: -1 }).limit(20));
});

export const enviarAvaliacao = asyncHandler(async (req, res) => {
  await Review.create({ ...req.body, aprovada: false, demo: false });
  res.status(201).json({ ok: true, mensagem: 'Obrigado! Sua avaliação será publicada após análise.' });
});
