import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { nextSequence } from '../models/Counter.js';
import { AppError, asyncHandler } from '../middlewares/error.js';
import { getSettings } from '../services/settingsService.js';
import { montarPedido } from '../services/orderService.js';

const FLUXO_FINAL = ['concluido', 'cancelado'];

export const criar = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const body = req.body;
  const { itens, subtotal, taxaEntrega, total, troco } = await montarPedido(body, settings);

  const seq = await nextSequence('pedido');
  const numero = `PED-${String(seq).padStart(5, '0')}`;

  const pedido = await Order.create({
    numero,
    cliente: body.cliente,
    tipo: body.tipo,
    endereco: body.tipo === 'entrega' ? body.endereco : undefined,
    itens,
    subtotal,
    taxaEntrega,
    total,
    pagamento: { forma: body.pagamento.forma, troco },
    observacoes: body.observacoes,
    historico: [{ status: 'aguardando_confirmacao' }],
  });

  await Product.bulkWrite(
    itens.map((i) => ({ updateOne: { filter: { _id: i.produto }, update: { $inc: { vendas: i.quantidade } } } }))
  );

  res.status(201).json(pedido);
});

// Acompanhamento público: exige número do pedido + telefone usado na compra
export const acompanhar = asyncHandler(async (req, res) => {
  const telefone = String(req.query.telefone || '').replace(/\D/g, '');
  const pedido = await Order.findOne({ numero: String(req.params.numero).toUpperCase() });
  if (!pedido || !telefone || pedido.cliente.telefone !== telefone) {
    throw new AppError('Pedido não encontrado. Confira o número e o telefone informados.', 404);
  }
  res.json(pedido);
});

export const listar = asyncHandler(async (req, res) => {
  const { status, q, limite } = req.query;
  const filtro = {};
  if (status && status !== 'todos') filtro.status = status;
  if (q) {
    const rx = new RegExp(String(q).slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtro.$or = [{ numero: rx }, { 'cliente.nome': rx }, { 'cliente.telefone': rx }];
  }
  const pedidos = await Order.find(filtro).sort({ createdAt: -1 }).limit(Math.min(Number(limite) || 100, 300));
  res.json(pedidos);
});

export const obter = asyncHandler(async (req, res) => {
  const pedido = await Order.findById(req.params.id);
  if (!pedido) throw new AppError('Pedido não encontrado.', 404);
  res.json(pedido);
});

export const atualizarStatus = asyncHandler(async (req, res) => {
  const pedido = await Order.findById(req.params.id);
  if (!pedido) throw new AppError('Pedido não encontrado.', 404);
  const { status } = req.body;

  if (FLUXO_FINAL.includes(pedido.status) && pedido.status !== status) {
    throw new AppError('Pedidos concluídos ou cancelados não podem ser alterados.', 409);
  }
  if (status === 'pronto_retirada' && pedido.tipo !== 'retirada' && pedido.tipo !== 'local') {
    throw new AppError('"Pronto para retirada" só se aplica a retirada ou consumo no local.', 400);
  }
  if (status === 'saiu_entrega' && pedido.tipo !== 'entrega') {
    throw new AppError('"Saiu para entrega" só se aplica a pedidos de entrega.', 400);
  }

  if (pedido.status !== status) {
    // cancelar devolve as vendas contabilizadas
    if (status === 'cancelado') {
      await Product.bulkWrite(
        pedido.itens.map((i) => ({ updateOne: { filter: { _id: i.produto }, update: { $inc: { vendas: -i.quantidade } } } }))
      );
    }
    pedido.status = status;
    pedido.historico.push({ status });
    await pedido.save();
  }
  res.json(pedido);
});
