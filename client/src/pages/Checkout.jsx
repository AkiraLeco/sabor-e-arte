import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Store, Armchair, Banknote, CreditCard, QrCode, ShoppingBag, ArrowLeft, MessageCircle, Check, Pencil } from 'lucide-react';
import { Field, EmptyState, SmartImage } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { brl, calcFee, maskPhone, onlyDigits, TIPO_LABEL, PAGAMENTO_LABEL } from '../services/format';
import { buildOrderMessage, whatsappLink } from '../services/whatsapp';
import { loadDraft, saveDraft, saveOrder } from '../services/storage';
import { useSeo } from '../hooks/useSeo';

const TIPOS = [
  { id: 'entrega', icon: Bike, desc: 'Receba em casa' },
  { id: 'retirada', icon: Store, desc: 'Busque no balcão' },
  { id: 'local', icon: Armchair, desc: 'Coma no salão' },
];
const PAGAMENTOS = [
  { id: 'pix', icon: QrCode },
  { id: 'dinheiro', icon: Banknote },
  { id: 'credito', icon: CreditCard },
  { id: 'debito', icon: CreditCard },
];

export default function Checkout() {
  useSeo({ title: 'Finalizar pedido', description: 'Informe seus dados e confirme seu pedido.' });
  const { items, subtotal, unit, clear, sync, changeQty } = useCart();
  const { settings } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();

  const draft = useMemo(loadDraft, []);
  const [form, setForm] = useState({
    nome: draft.nome || '', telefone: draft.telefone || '', tipo: draft.tipo || 'entrega',
    rua: draft.rua || '', numero: draft.numero || '', complemento: draft.complemento || '', bairro: draft.bairro || '',
    pagamento: draft.pagamento || 'pix', troco: '', precisaTroco: false, observacoes: '',
  });
  const [erros, setErros] = useState({});
  const [etapa, setEtapa] = useState('form');
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState('');

  // Atualiza preços/disponibilidade do carrinho com o que está no servidor
  useEffect(() => {
    if (!items.length) return;
    api.produtos().then((fresh) => {
      const antes = JSON.stringify(items.map((i) => [i.produto._id, i.produto.precoFinal, i.produto.disponivel]));
      sync(fresh);
      const indisponiveis = items.filter((i) => !fresh.find((p) => p._id === i.produto._id && p.disponivel));
      if (indisponiveis.length) toast.error(`Indisponível no momento: ${indisponiveis.map((i) => i.produto.nome).join(', ')}. Remova para continuar.`);
      else if (antes !== JSON.stringify(items.map((i) => [i.produto._id, fresh.find((p) => p._id === i.produto._id)?.precoFinal, true]))) toast.info('Alguns valores foram atualizados.');
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const tiposAtivos = TIPOS.filter((t) => settings?.tiposPedido?.[t.id]);
  const pagAtivos = PAGAMENTOS.filter((p) => settings?.pagamentos?.[p.id]);

  // Se a opção escolhida deixou de existir nas configurações, escolhe a primeira disponível
  useEffect(() => {
    if (!settings) return;
    if (tiposAtivos.length && !settings.tiposPedido[form.tipo]) setForm((f) => ({ ...f, tipo: tiposAtivos[0].id }));
    if (pagAtivos.length && !settings.pagamentos[form.pagamento]) setForm((f) => ({ ...f, pagamento: pagAtivos[0].id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const taxa = calcFee(settings, form.tipo, form.bairro, subtotal);
  const total = subtotal + taxa;
  const min = settings?.pedidoMinimo || 0;
  const indisponivel = items.some((i) => !i.produto.disponivel);
  const trocoNum = Number(String(form.troco).replace(',', '.')) || 0;

  const validar = () => {
    const e = {};
    if (form.nome.trim().split(/\s+/).filter(Boolean).length < 2) e.nome = 'Informe seu nome completo.';
    const tel = onlyDigits(form.telefone);
    if (tel.length < 10 || tel.length > 11) e.telefone = 'Informe o telefone com DDD.';
    if (form.tipo === 'entrega') {
      if (form.rua.trim().length < 3) e.rua = 'Informe a rua.';
      if (!form.numero.trim()) e.numero = 'Informe o número.';
      if (form.bairro.trim().length < 2) e.bairro = 'Informe o bairro.';
    }
    if (form.pagamento === 'dinheiro' && form.precisaTroco && trocoNum < total) e.troco = `O valor deve ser de pelo menos ${brl(total)}.`;
    if (min > 0 && subtotal < min) e.geral = `O pedido mínimo é de ${brl(min)}.`;
    if (indisponivel) e.geral = 'Há itens indisponíveis no carrinho. Remova-os para continuar.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const revisar = (e) => {
    e.preventDefault();
    if (!validar()) return toast.error('Confira os campos destacados.');
    saveDraft({ nome: form.nome, telefone: form.telefone, tipo: form.tipo, rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, pagamento: form.pagamento });
    setEtapa('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmar = async (viaWhatsapp) => {
    setEnviando(true);
    setErroServidor('');
    // Abre a aba antes do await para não ser bloqueada pelo navegador
    const aba = viaWhatsapp ? window.open('', '_blank') : null;
    try {
      const pedido = await api.criarPedido({
        cliente: { nome: form.nome.trim(), telefone: onlyDigits(form.telefone) },
        tipo: form.tipo,
        endereco: form.tipo === 'entrega' ? { rua: form.rua.trim(), numero: form.numero.trim(), complemento: form.complemento.trim(), bairro: form.bairro.trim() } : undefined,
        itens: items.map((i) => ({
          produtoId: i.produto._id,
          quantidade: i.quantidade,
          adicionaisIds: i.adicionais.map((a) => a._id),
          removidos: i.removidos,
          observacao: i.observacao,
        })),
        pagamento: { forma: form.pagamento, troco: form.pagamento === 'dinheiro' && form.precisaTroco ? trocoNum : null },
        observacoes: form.observacoes.trim(),
      });
      saveOrder({ numero: pedido.numero, telefone: pedido.cliente.telefone });
      if (viaWhatsapp && settings?.whatsapp && aba) {
        aba.location.href = whatsappLink(settings.whatsapp, buildOrderMessage(pedido, settings.nome));
      } else aba?.close();
      clear();
      navigate(`/pedido/${pedido.numero}`, { state: { novo: true, pedido } });
    } catch (err) {
      aba?.close();
      setErroServidor(err.message + (err.details?.length ? ` (${err.details.join('; ')})` : ''));
      toast.error(err.message);
      setEnviando(false);
    }
  };

  if (!items.length) {
    return (
      <main id="conteudo" className="page"><div className="container"><EmptyState icon={ShoppingBag} title="Seu carrinho está vazio" text="Adicione pratos do cardápio para finalizar o pedido.">
        <Link to="/cardapio" className="btn btn--primary">VER CARDÁPIO</Link>
      </EmptyState></div></main>
    );
  }

  const Summary = (
    <aside className="card summary" aria-label="Resumo do pedido">
      <h2>Resumo</h2>
      <ul>
        {items.map((i) => (
          <li key={i.key}>
            <SmartImage src={i.produto.imagem} alt="" className="summary__img" />
            <div>
              <strong>{i.quantidade}x {i.produto.nome}</strong>
              {i.adicionais.length > 0 && <small>+ {i.adicionais.map((a) => a.nome).join(', ')}</small>}
              {i.removidos.length > 0 && <small>Sem {i.removidos.join(', ').toLowerCase()}</small>}
              {i.observacao && <small>Obs.: {i.observacao}</small>}
              {!i.produto.disponivel && <small className="text-error">Indisponível — remova do pedido</small>}
              {etapa === 'form' && !i.produto.disponivel && <button type="button" className="link" onClick={() => changeQty(i.key, -i.quantidade)}>Remover</button>}
            </div>
            <span>{brl(unit(i) * i.quantidade)}</span>
          </li>
        ))}
      </ul>
      <dl className="totals">
        <div><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
        {form.tipo === 'entrega' && <div><dt>Taxa de entrega</dt><dd>{taxa === 0 ? 'Grátis' : brl(taxa)}</dd></div>}
        <div className="totals__total"><dt>Total</dt><dd>{brl(total)}</dd></div>
      </dl>
      {settings?.entregaGratisAcimaDe > 0 && form.tipo === 'entrega' && subtotal < settings.entregaGratisAcimaDe && (
        <p className="summary__tip">Faltam {brl(settings.entregaGratisAcimaDe - subtotal)} para entrega grátis!</p>
      )}
    </aside>
  );

  if (etapa === 'review') {
    return (
      <main id="conteudo" className="page checkout">
        <div className="container">
          <button className="link back" onClick={() => setEtapa('form')}><ArrowLeft size={16} /> Voltar e editar</button>
          <h1>Revise seu pedido</h1>
          <div className="checkout__grid">
            <motion.div className="card review-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <dl className="details">
                <div><dt>Cliente</dt><dd>{form.nome}<br />{maskPhone(form.telefone)}</dd></div>
                <div><dt>Tipo de pedido</dt><dd>{TIPO_LABEL[form.tipo]}</dd></div>
                {form.tipo === 'entrega' && (
                  <div><dt>Endereço de entrega</dt><dd>{form.rua}, {form.numero}{form.complemento ? ` - ${form.complemento}` : ''}<br />{form.bairro}</dd></div>
                )}
                <div><dt>Pagamento</dt><dd>{PAGAMENTO_LABEL[form.pagamento]}{form.pagamento === 'dinheiro' && form.precisaTroco ? ` — troco para ${brl(trocoNum)} (troco: ${brl(trocoNum - total)})` : ''}</dd></div>
                {form.observacoes && <div><dt>Observações</dt><dd>{form.observacoes}</dd></div>}
              </dl>
              {form.pagamento === 'pix' && settings?.chavePix && (
                <p className="alert alert--info">Chave Pix para pagamento: <strong>{settings.chavePix}</strong>. Envie o comprovante ao restaurante após confirmar.</p>
              )}
              {erroServidor && <p className="alert alert--error" role="alert">{erroServidor}</p>}
              <div className="review-card__actions">
                <button className="btn btn--primary btn--lg" disabled={enviando} onClick={() => confirmar(false)}>
                  <Check size={18} /> {enviando ? 'ENVIANDO...' : 'CONFIRMAR PEDIDO'}
                </button>
                {settings?.whatsapp && (
                  <button className="btn btn--whatsapp btn--lg" disabled={enviando} onClick={() => confirmar(true)}>
                    <MessageCircle size={18} /> CONFIRMAR E ENVIAR PELO WHATSAPP
                  </button>
                )}
                <button className="btn btn--ghost" onClick={() => setEtapa('form')} disabled={enviando}><Pencil size={16} /> Editar dados</button>
              </div>
            </motion.div>
            {Summary}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="conteudo" className="page checkout">
      <div className="container">
        <Link to="/cardapio" className="link back"><ArrowLeft size={16} /> Continuar escolhendo</Link>
        <h1>Finalizar pedido</h1>
        <div className="checkout__grid">
          <form onSubmit={revisar} noValidate className="checkout__form">
            {erros.geral && <p className="alert alert--error" role="alert">{erros.geral}</p>}

            <fieldset className="card">
              <legend>1. Seus dados</legend>
              <Field label="Nome completo *" id="c-nome" error={erros.nome}><input id="c-nome" value={form.nome} onChange={set('nome')} autoComplete="name" maxLength={80} /></Field>
              <Field label="Telefone / WhatsApp *" id="c-tel" error={erros.telefone}>
                <input id="c-tel" type="tel" inputMode="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" autoComplete="tel" />
              </Field>
            </fieldset>

            <fieldset className="card">
              <legend>2. Tipo de pedido</legend>
              <div className="choice-grid">
                {tiposAtivos.map(({ id, icon: Icon, desc }) => (
                  <label key={id} className={`choice${form.tipo === id ? ' is-active' : ''}`}>
                    <input type="radio" name="tipo" value={id} checked={form.tipo === id} onChange={set('tipo')} />
                    <Icon size={22} aria-hidden="true" /><strong>{TIPO_LABEL[id]}</strong><small>{desc}</small>
                  </label>
                ))}
              </div>
              {tiposAtivos.length === 0 && <p className="alert alert--warn">O restaurante não está aceitando pedidos online no momento.</p>}

              {form.tipo === 'entrega' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="address">
                  <div className="form-row form-row--wide">
                    <Field label="Rua *" id="c-rua" error={erros.rua}><input id="c-rua" value={form.rua} onChange={set('rua')} autoComplete="address-line1" maxLength={120} /></Field>
                    <Field label="Número *" id="c-num" error={erros.numero}><input id="c-num" value={form.numero} onChange={set('numero')} maxLength={15} /></Field>
                  </div>
                  <div className="form-row">
                    <Field label="Complemento" id="c-comp"><input id="c-comp" value={form.complemento} onChange={set('complemento')} placeholder="Apto, bloco, referência" maxLength={60} /></Field>
                    <Field label="Bairro *" id="c-bairro" error={erros.bairro} hint={settings?.taxasPorBairro?.length ? 'A taxa varia conforme o bairro.' : undefined}>
                      <input id="c-bairro" list="bairros" value={form.bairro} onChange={set('bairro')} maxLength={60} autoComplete="address-level2" />
                      <datalist id="bairros">{(settings?.taxasPorBairro || []).map((t) => <option key={t.bairro} value={t.bairro} />)}</datalist>
                    </Field>
                  </div>
                </motion.div>
              )}
            </fieldset>

            <fieldset className="card">
              <legend>3. Forma de pagamento</legend>
              <div className="choice-grid choice-grid--4">
                {pagAtivos.map(({ id, icon: Icon }) => (
                  <label key={id} className={`choice choice--sm${form.pagamento === id ? ' is-active' : ''}`}>
                    <input type="radio" name="pagamento" value={id} checked={form.pagamento === id} onChange={set('pagamento')} />
                    <Icon size={20} aria-hidden="true" /><strong>{PAGAMENTO_LABEL[id]}</strong>
                  </label>
                ))}
              </div>
              {form.pagamento === 'pix' && settings?.chavePix && <p className="alert alert--info">Chave Pix: <strong>{settings.chavePix}</strong></p>}
              {form.pagamento === 'dinheiro' && (
                <div className="troco">
                  <label className="check">
                    <input type="checkbox" checked={form.precisaTroco} onChange={(e) => setForm({ ...form, precisaTroco: e.target.checked })} />
                    <span>Preciso de troco</span>
                  </label>
                  {form.precisaTroco && (
                    <Field label="Troco para quanto? (R$)" id="c-troco" error={erros.troco}>
                      <input id="c-troco" inputMode="decimal" value={form.troco} onChange={set('troco')} placeholder={`Ex.: ${Math.ceil(total / 10) * 10 + 10}`} />
                    </Field>
                  )}
                </div>
              )}
            </fieldset>

            <fieldset className="card">
              <legend>4. Observações</legend>
              <Field label="Alguma observação para o pedido?" id="c-obs"><textarea id="c-obs" rows={3} maxLength={300} value={form.observacoes} onChange={set('observacoes')} placeholder="Ex.: tocar o interfone, sem talheres descartáveis..." /></Field>
            </fieldset>

            <button className="btn btn--primary btn--lg btn--block" disabled={tiposAtivos.length === 0}>REVISAR PEDIDO</button>
          </form>
          {Summary}
        </div>
      </div>
    </main>
  );
}
