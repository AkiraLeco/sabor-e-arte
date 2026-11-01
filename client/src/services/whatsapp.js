import { brl, PAGAMENTO_LABEL, TIPO_LABEL } from './format';

// Monta a mensagem a partir de um pedido já registrado no servidor (valores confiáveis)
export function buildOrderMessage(pedido, restaurante = '') {
  const L = [];
  L.push(`*Novo pedido ${pedido.numero}*${restaurante ? ` - ${restaurante}` : ''}`);
  L.push('');
  L.push(`*Cliente:* ${pedido.cliente.nome}`);
  L.push(`*Telefone:* ${pedido.cliente.telefone}`);
  L.push(`*Tipo:* ${TIPO_LABEL[pedido.tipo]}`);
  if (pedido.tipo === 'entrega') {
    const e = pedido.endereco;
    L.push(`*Endereço:* ${e.rua}, ${e.numero}${e.complemento ? ` (${e.complemento})` : ''} - ${e.bairro}`);
  }
  L.push('');
  L.push('*Itens:*');
  pedido.itens.forEach((i) => {
    L.push(`• ${i.quantidade}x ${i.nome} - ${brl(i.subtotal)}`);
    i.adicionais?.forEach((a) => L.push(`   + ${a.nome}${a.preco ? ` (${brl(a.preco)})` : ''}`));
    if (i.removidos?.length) L.push(`   Sem: ${i.removidos.join(', ')}`);
    if (i.observacao) L.push(`   Obs.: ${i.observacao}`);
  });
  L.push('');
  L.push(`Subtotal: ${brl(pedido.subtotal)}`);
  if (pedido.tipo === 'entrega') L.push(`Taxa de entrega: ${brl(pedido.taxaEntrega)}`);
  L.push(`*Total: ${brl(pedido.total)}*`);
  L.push('');
  L.push(`*Pagamento:* ${PAGAMENTO_LABEL[pedido.pagamento.forma]}`);
  if (pedido.pagamento.troco) L.push(`Troco para: ${brl(pedido.pagamento.troco)}`);
  if (pedido.observacoes) L.push(`*Observações:* ${pedido.observacoes}`);
  return L.join('\n');
}

export const whatsappLink = (numero, texto = '') =>
  `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
