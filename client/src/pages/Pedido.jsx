import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, XCircle, MessageCircle, Search, PartyPopper } from 'lucide-react';
import { Field, Skeleton } from '../components/ui';
import { api } from '../services/api';
import { brl, formatDateTime, maskPhone, onlyDigits, STATUS_LABEL, stepsFor, TIPO_LABEL, PAGAMENTO_LABEL } from '../services/format';
import { buildOrderMessage, whatsappLink } from '../services/whatsapp';
import { findOrder, loadOrders, saveOrder } from '../services/storage';
import { useSettings } from '../context/SettingsContext';
import { useSeo } from '../hooks/useSeo';

const FINAIS = ['concluido', 'cancelado'];

export default function Pedido() {
  useSeo({ title: 'Acompanhar pedido', description: 'Acompanhe o status do seu pedido em tempo real.' });
  const { numero } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [pedido, setPedido] = useState(state?.pedido || null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState({ numero: numero || '', telefone: '' });
  const novo = Boolean(state?.novo);

  const telefone = pedido?.cliente.telefone || findOrder(numero)?.telefone;

  // Carrega e atualiza o status periodicamente (a cada 15 s) até o pedido ser finalizado
  useEffect(() => {
    if (!numero || !telefone) return undefined;
    let ativo = true;
    const carregar = async (primeira) => {
      if (primeira && !pedido) setCarregando(true);
      try {
        const p = await api.acompanharPedido(numero, telefone);
        if (ativo) { setPedido(p); setErro(''); }
      } catch (e) {
        if (ativo && primeira) setErro(e.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    carregar(true);
    const id = setInterval(() => !document.hidden && !FINAIS.includes(pedido?.status) && carregar(false), 15000);
    return () => { ativo = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numero, telefone, pedido?.status]);

  const consultar = async (e) => {
    e.preventDefault();
    const n = busca.numero.trim().toUpperCase();
    const t = onlyDigits(busca.telefone);
    if (!n || t.length < 10) return setErro('Informe o número do pedido e o telefone com DDD.');
    setCarregando(true);
    setErro('');
    try {
      const p = await api.acompanharPedido(n, t);
      saveOrder({ numero: p.numero, telefone: t });
      setPedido(p);
      navigate(`/pedido/${p.numero}`, { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  if (!numero || (!pedido && (erro || !telefone))) {
    const recentes = loadOrders();
    return (
      <main id="conteudo" className="page"><div className="container container--narrow">
        <h1>Acompanhar pedido</h1>
        <form className="card form-card" onSubmit={consultar} noValidate>
          <Field label="Número do pedido" id="p-num"><input id="p-num" value={busca.numero} onChange={(e) => setBusca({ ...busca, numero: e.target.value })} placeholder="PED-00001" /></Field>
          <Field label="Telefone usado no pedido" id="p-tel"><input id="p-tel" type="tel" value={busca.telefone} onChange={(e) => setBusca({ ...busca, telefone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" /></Field>
          {erro && <p className="alert alert--error" role="alert">{erro}</p>}
          <button className="btn btn--primary" disabled={carregando}><Search size={16} /> {carregando ? 'BUSCANDO...' : 'CONSULTAR'}</button>
        </form>
        {recentes.length > 0 && (
          <div className="card" style={{ marginTop: 20 }}>
            <h2>Pedidos neste aparelho</h2>
            <ul className="recent">{recentes.map((o) => <li key={o.numero}><Link to={`/pedido/${o.numero}`} onClick={() => setErro('')}>{o.numero}</Link></li>)}</ul>
          </div>
        )}
      </div></main>
    );
  }

  if (!pedido) {
    return <main id="conteudo" className="page"><div className="container container--narrow"><Skeleton style={{ height: 300 }} /></div></main>;
  }

  const cancelado = pedido.status === 'cancelado';
  const steps = stepsFor(pedido.tipo);
  const atual = steps.indexOf(pedido.status);

  return (
    <main id="conteudo" className="page"><div className="container container--narrow">
      {novo && (
        <motion.div className="success-banner" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <PartyPopper size={34} aria-hidden="true" />
          <div>
            <h2>Pedido realizado com sucesso!</h2>
            <p>Anote o número do seu pedido: <strong>{pedido.numero}</strong>. Acompanhe o andamento nesta página.</p>
          </div>
        </motion.div>
      )}

      <header className="order-head">
        <div><span className="eyebrow">Pedido</span><h1>{pedido.numero}</h1></div>
        <span className={`status status--${pedido.status}`}>{STATUS_LABEL[pedido.status]}</span>
      </header>

      <section className="card" aria-label="Andamento do pedido">
        {cancelado ? (
          <p className="alert alert--error"><XCircle size={18} /> Este pedido foi cancelado. Em caso de dúvidas, entre em contato com o restaurante.</p>
        ) : (
          <ol className="timeline">
            {steps.map((s, i) => (
              <li key={s} className={i < atual ? 'is-done' : i === atual ? 'is-current' : ''} aria-current={i === atual ? 'step' : undefined}>
                {i <= atual ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                <span>{STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
        <small className="muted">Atualizado automaticamente. Feito em {formatDateTime(pedido.createdAt)}.</small>
      </section>

      <section className="card">
        <h2>Itens</h2>
        <ul className="order-items">
          {pedido.itens.map((i, idx) => (
            <li key={idx}>
              <div>
                <strong>{i.quantidade}x {i.nome}</strong>
                {i.adicionais?.length > 0 && <small>+ {i.adicionais.map((a) => a.nome).join(', ')}</small>}
                {i.removidos?.length > 0 && <small>Sem {i.removidos.join(', ').toLowerCase()}</small>}
                {i.observacao && <small>Obs.: {i.observacao}</small>}
              </div>
              <span>{brl(i.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Subtotal</dt><dd>{brl(pedido.subtotal)}</dd></div>
          {pedido.tipo === 'entrega' && <div><dt>Taxa de entrega</dt><dd>{pedido.taxaEntrega ? brl(pedido.taxaEntrega) : 'Grátis'}</dd></div>}
          <div className="totals__total"><dt>Total</dt><dd>{brl(pedido.total)}</dd></div>
        </dl>
        <dl className="details">
          <div><dt>Tipo</dt><dd>{TIPO_LABEL[pedido.tipo]}</dd></div>
          {pedido.tipo === 'entrega' && <div><dt>Endereço</dt><dd>{pedido.endereco.rua}, {pedido.endereco.numero}{pedido.endereco.complemento ? ` - ${pedido.endereco.complemento}` : ''} — {pedido.endereco.bairro}</dd></div>}
          <div><dt>Pagamento</dt><dd>{PAGAMENTO_LABEL[pedido.pagamento.forma]}{pedido.pagamento.troco ? ` (troco para ${brl(pedido.pagamento.troco)})` : ''}</dd></div>
        </dl>
      </section>

      <div className="order-actions">
        {settings?.whatsapp && (
          <a className="btn btn--whatsapp" target="_blank" rel="noreferrer" href={whatsappLink(settings.whatsapp, buildOrderMessage(pedido, settings.nome))}>
            <MessageCircle size={18} /> ENVIAR PEDIDO PELO WHATSAPP
          </a>
        )}
        <Link to="/cardapio" className="btn btn--outline">VOLTAR AO CARDÁPIO</Link>
      </div>
    </div></main>
  );
}
