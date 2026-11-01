import Product from '../models/Product.js';
import { AppError } from '../middlewares/error.js';

const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const norm = (s) => String(s || '').trim().toLowerCase();

export function calcularTaxaEntrega(settings, tipo, bairro, subtotal) {
  if (tipo !== 'entrega') return 0;
  if (settings.entregaGratisAcimaDe > 0 && subtotal >= settings.entregaGratisAcimaDe) return 0;
  const especifica = settings.taxasPorBairro.find((t) => norm(t.bairro) === norm(bairro));
  return round(especifica ? especifica.taxa : settings.taxaEntregaPadrao);
}

/**
 * Recalcula tudo a partir dos preços cadastrados no banco.
 * Os valores enviados pelo navegador (preços/totais) são ignorados por completo.
 */
export async function montarPedido(payload, settings) {
  if (!settings.tiposPedido[payload.tipo]) throw new AppError('Este tipo de pedido não está disponível no momento.', 400);
  if (!settings.pagamentos[payload.pagamento.forma]) throw new AppError('Esta forma de pagamento não está disponível.', 400);
  if (payload.tipo === 'entrega' && !payload.endereco?.rua) throw new AppError('Informe o endereço para entrega.', 400);

  const ids = [...new Set(payload.itens.map((i) => i.produtoId))];
  const produtos = await Product.find({ _id: { $in: ids } });
  const porId = new Map(produtos.map((p) => [String(p._id), p]));

  const itens = payload.itens.map((item) => {
    const p = porId.get(item.produtoId);
    if (!p) throw new AppError('Um dos produtos do carrinho não existe mais. Atualize seu pedido.', 400);
    if (!p.disponivel) throw new AppError(`"${p.nome}" está indisponível no momento.`, 400);

    const adicionais = (item.adicionaisIds || []).map((aid) => {
      const a = p.adicionais.id(aid);
      if (!a) throw new AppError(`Adicional inválido para "${p.nome}".`, 400);
      return { nome: a.nome, preco: a.preco };
    });

    const removidos = (item.removidos || []).filter((r) => p.ingredientes.includes(r));
    const precoBase = p.precoAtual();
    const precoUnitario = round(precoBase + adicionais.reduce((s, a) => s + a.preco, 0));

    return {
      produto: p._id,
      nome: p.nome,
      precoBase,
      quantidade: item.quantidade,
      adicionais,
      removidos,
      observacao: item.observacao || '',
      precoUnitario,
      subtotal: round(precoUnitario * item.quantidade),
    };
  });

  const subtotal = round(itens.reduce((s, i) => s + i.subtotal, 0));
  if (settings.pedidoMinimo > 0 && subtotal < settings.pedidoMinimo) {
    throw new AppError(`O pedido mínimo é de R$ ${settings.pedidoMinimo.toFixed(2).replace('.', ',')}.`, 400);
  }

  const taxaEntrega = calcularTaxaEntrega(settings, payload.tipo, payload.endereco?.bairro, subtotal);
  const total = round(subtotal + taxaEntrega);

  let troco = null;
  if (payload.pagamento.forma === 'dinheiro' && payload.pagamento.troco) {
    if (payload.pagamento.troco < total) throw new AppError('O valor para troco deve ser maior ou igual ao total do pedido.', 400);
    troco = payload.pagamento.troco;
  }

  return { itens, subtotal, taxaEntrega, total, troco };
}
