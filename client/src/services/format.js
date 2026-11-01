export const brl = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const STATUS_LABEL = {
  aguardando_confirmacao: 'Aguardando confirmação',
  confirmado: 'Confirmado',
  em_preparacao: 'Em preparação',
  pronto_retirada: 'Pronto para retirada',
  saiu_entrega: 'Saiu para entrega',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const TIPO_LABEL = { entrega: 'Entrega', retirada: 'Retirada no local', local: 'Consumo no local' };
export const PAGAMENTO_LABEL = { pix: 'Pix', dinheiro: 'Dinheiro', credito: 'Cartão de crédito', debito: 'Cartão de débito' };

// Etapas exibidas no acompanhamento, conforme o tipo de pedido
export const stepsFor = (tipo) => [
  'aguardando_confirmacao',
  'confirmado',
  'em_preparacao',
  tipo === 'entrega' ? 'saiu_entrega' : 'pronto_retirada',
  'concluido',
];

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export const onlyDigits = (s) => String(s || '').replace(/\D/g, '');

export function maskPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Mesma regra do servidor (o servidor é quem vale; aqui é só para exibir antes do pedido)
export function calcFee(settings, tipo, bairro, subtotal) {
  if (!settings || tipo !== 'entrega') return 0;
  if (settings.entregaGratisAcimaDe > 0 && subtotal >= settings.entregaGratisAcimaDe) return 0;
  const norm = (s) => String(s || '').trim().toLowerCase();
  const esp = (settings.taxasPorBairro || []).find((t) => norm(t.bairro) === norm(bairro));
  return esp ? esp.taxa : settings.taxaEntregaPadrao;
}

export const unitPrice = (produto, adicionais = []) =>
  (produto.precoFinal ?? produto.preco) + adicionais.reduce((s, a) => s + a.preco, 0);
