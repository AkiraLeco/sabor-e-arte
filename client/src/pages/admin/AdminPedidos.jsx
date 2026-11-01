import { useEffect, useRef, useState } from 'react';
import { Search, Eye, RefreshCw, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Modal, Skeleton } from '../../components/ui';
import { brl, formatDateTime, STATUS_LABEL, TIPO_LABEL, PAGAMENTO_LABEL, maskPhone } from '../../services/format';

const STATUS = Object.keys(STATUS_LABEL);

// Opções de status válidas conforme o tipo do pedido
const opcoes = (tipo) => STATUS.filter((s) => (s === 'saiu_entrega' ? tipo === 'entrega' : s === 'pronto_retirada' ? tipo !== 'entrega' : true));

export default function AdminPedidos() {
  const toast = useToast();
  const [status, setStatus] = useState('todos');
  const [q, setQ] = useState('');
  const [busca, setBusca] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const conhecidos = useRef(null);

  const { data, loading, error, refresh, reload } = useFetch(() => api.pedidos({ status, q: busca }), [status, busca], { interval: 10000 });

  useEffect(() => { const t = setTimeout(() => setBusca(q.trim()), 350); return () => clearTimeout(t); }, [q]);

  // Avisa quando chegam pedidos novos (atualização periódica a cada 10 s)
  useEffect(() => {
    if (!data) return;
    const ids = new Set(data.map((p) => p._id));
    if (conhecidos.current) {
      const novos = data.filter((p) => !conhecidos.current.has(p._id) && p.status === 'aguardando_confirmacao');
      if (novos.length) toast.info(`🔔 ${novos.length} novo(s) pedido(s): ${novos.map((n) => n.numero).join(', ')}`);
    }
    conhecidos.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mudar = async (p, novo) => {
    try {
      const atualizado = await api.atualizarStatus(p._id, novo);
      toast.success(`${p.numero}: ${STATUS_LABEL[novo]}`);
      setDetalhe((d) => (d?._id === p._id ? atualizado : d));
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <header className="admin__head">
        <h1>Pedidos</h1>
        <button className="btn btn--outline btn--sm" onClick={reload}><RefreshCw size={14} /> Atualizar</button>
      </header>

      <div className="admin-filters">
        <div className="search">
          <Search size={18} aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número, nome ou telefone" aria-label="Buscar pedidos" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status">
          <option value="todos">Todos os status</option>
          {STATUS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {error && <p className="alert alert--error">{error}</p>}
      {loading && !data ? <Skeleton style={{ height: 240 }} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Produtos</th><th>Total</th><th>Tipo</th><th>Pagamento</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {data?.length === 0 && <tr><td colSpan={9} className="table__empty">Nenhum pedido encontrado.</td></tr>}
              {data?.map((p) => (
                <tr key={p._id} className={p.status === 'aguardando_confirmacao' ? 'is-new' : ''}>
                  <td data-label="Pedido"><strong>{p.numero}</strong></td>
                  <td data-label="Cliente">{p.cliente.nome}<br /><small>{maskPhone(p.cliente.telefone)}</small></td>
                  <td data-label="Data">{formatDateTime(p.createdAt)}</td>
                  <td data-label="Produtos" className="table__items">{p.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}</td>
                  <td data-label="Total"><strong>{brl(p.total)}</strong></td>
                  <td data-label="Tipo">{TIPO_LABEL[p.tipo]}</td>
                  <td data-label="Pagamento">{PAGAMENTO_LABEL[p.pagamento.forma]}</td>
                  <td data-label="Status">
                    <select className={`status-select status--${p.status}`} value={p.status} onChange={(e) => mudar(p, e.target.value)} aria-label={`Status do pedido ${p.numero}`} disabled={['concluido', 'cancelado'].includes(p.status)}>
                      {opcoes(p.tipo).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td><button className="icon-btn" onClick={() => setDetalhe(p)} aria-label={`Ver detalhes de ${p.numero}`}><Eye size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(detalhe)} onClose={() => setDetalhe(null)} label="Detalhes do pedido" className="order-modal">
        {detalhe && (
          <div className="order-modal__body">
            <header>
              <h2>{detalhe.numero}</h2>
              <span className={`status status--${detalhe.status}`}>{STATUS_LABEL[detalhe.status]}</span>
            </header>
            <dl className="details">
              <div><dt>Cliente</dt><dd>{detalhe.cliente.nome} · <a href={`tel:${detalhe.cliente.telefone}`}><Phone size={12} /> {maskPhone(detalhe.cliente.telefone)}</a></dd></div>
              <div><dt>Data</dt><dd>{formatDateTime(detalhe.createdAt)}</dd></div>
              <div><dt>Tipo</dt><dd>{TIPO_LABEL[detalhe.tipo]}</dd></div>
              {detalhe.tipo === 'entrega' && <div><dt>Endereço</dt><dd>{detalhe.endereco.rua}, {detalhe.endereco.numero}{detalhe.endereco.complemento ? ` - ${detalhe.endereco.complemento}` : ''} — {detalhe.endereco.bairro}</dd></div>}
              <div><dt>Pagamento</dt><dd>{PAGAMENTO_LABEL[detalhe.pagamento.forma]}{detalhe.pagamento.troco ? ` — troco para ${brl(detalhe.pagamento.troco)} (devolver ${brl(detalhe.pagamento.troco - detalhe.total)})` : ''}</dd></div>
              {detalhe.observacoes && <div><dt>Observações</dt><dd>{detalhe.observacoes}</dd></div>}
            </dl>
            <ul className="order-items">
              {detalhe.itens.map((i, idx) => (
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
              <div><dt>Subtotal</dt><dd>{brl(detalhe.subtotal)}</dd></div>
              {detalhe.tipo === 'entrega' && <div><dt>Entrega</dt><dd>{brl(detalhe.taxaEntrega)}</dd></div>}
              <div className="totals__total"><dt>Total</dt><dd>{brl(detalhe.total)}</dd></div>
            </dl>
            <div className="field">
              <label htmlFor="mudar-status">Atualizar status</label>
              <select id="mudar-status" value={detalhe.status} onChange={(e) => mudar(detalhe, e.target.value)} disabled={['concluido', 'cancelado'].includes(detalhe.status)}>
                {opcoes(detalhe.tipo).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <ol className="history">
              {detalhe.historico.map((h, i) => <li key={i}>{STATUS_LABEL[h.status]} <small>{formatDateTime(h.em)}</small></li>)}
            </ol>
          </div>
        )}
      </Modal>
    </>
  );
}
