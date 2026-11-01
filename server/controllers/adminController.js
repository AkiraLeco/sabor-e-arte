import Order from '../models/Order.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';
import { AppError, asyncHandler } from '../middlewares/error.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const contagem = await Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, valor: { $sum: '$total' } } }]);
  const por = Object.fromEntries(contagem.map((c) => [c._id, c]));
  const n = (s) => por[s]?.n || 0;

  const pendentes = n('aguardando_confirmacao') + n('confirmado');
  const emPreparacao = n('em_preparacao') + n('pronto_retirada') + n('saiu_entrega');
  const total = contagem.reduce((s, c) => s + c.n, 0);

  // Faturamento = pedidos concluídos
  const faturamento = por.concluido?.valor || 0;
  const emAberto = contagem
    .filter((c) => !['concluido', 'cancelado'].includes(c._id))
    .reduce((s, c) => s + c.valor, 0);

  const maisVendidos = await Order.aggregate([
    { $match: { status: { $ne: 'cancelado' } } },
    { $unwind: '$itens' },
    { $group: { _id: '$itens.nome', quantidade: { $sum: '$itens.quantidade' }, receita: { $sum: '$itens.subtotal' } } },
    { $sort: { quantidade: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, nome: '$_id', quantidade: 1, receita: 1 } },
  ]);

  const desde = new Date();
  desde.setDate(desde.getDate() - 6);
  desde.setHours(0, 0, 0, 0);
  const vendasDia = await Order.aggregate([
    { $match: { createdAt: { $gte: desde }, status: { $ne: 'cancelado' } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'America/Sao_Paulo' } }, pedidos: { $sum: 1 }, valor: { $sum: '$total' } } },
  ]);
  const mapa = new Map(vendasDia.map((v) => [v._id, v]));
  const ultimosDias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(desde);
    d.setDate(d.getDate() + i);
    const chave = d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    return { data: chave, pedidos: mapa.get(chave)?.pedidos || 0, valor: mapa.get(chave)?.valor || 0 };
  });

  res.json({
    totalPedidos: total,
    pedidosPendentes: pendentes,
    pedidosEmPreparacao: emPreparacao,
    pedidosConcluidos: n('concluido'),
    pedidosCancelados: n('cancelado'),
    faturamento,
    emAberto,
    maisVendidos,
    ultimosDias,
    mensagensNaoLidas: await Message.countDocuments({ lida: false }),
    avaliacoesPendentes: await Review.countDocuments({ aprovada: false }),
  });
});

export const listarMensagens = asyncHandler(async (_req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }).limit(200));
});

export const marcarMensagem = asyncHandler(async (req, res) => {
  const m = await Message.findByIdAndUpdate(req.params.id, { lida: req.body.lida !== false }, { new: true });
  if (!m) throw new AppError('Mensagem não encontrada.', 404);
  res.json(m);
});

export const excluirMensagem = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export const listarAvaliacoesAdmin = asyncHandler(async (_req, res) => {
  res.json(await Review.find().sort({ createdAt: -1 }).limit(200));
});

export const moderarAvaliacao = asyncHandler(async (req, res) => {
  const r = await Review.findByIdAndUpdate(req.params.id, { aprovada: req.body.aprovada !== false }, { new: true });
  if (!r) throw new AppError('Avaliação não encontrada.', 404);
  res.json(r);
});

export const excluirAvaliacao = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
