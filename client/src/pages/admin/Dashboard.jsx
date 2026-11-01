import { Link } from 'react-router-dom';
import { ClipboardList, Clock, ChefHat, CheckCircle2, Wallet, Inbox, MessageSquareQuote } from 'lucide-react';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { brl } from '../../services/format';
import { Skeleton } from '../../components/ui';

function Stat({ icon: Icon, label, value, tone = '' }) {
  return (
    <div className={`stat ${tone}`}>
      <span className="stat__icon"><Icon size={22} aria-hidden="true" /></span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </div>
  );
}

export default function Dashboard() {
  const { data: d, loading, error } = useFetch(() => api.dashboard(), [], { interval: 20000 });

  if (error) return <p className="alert alert--error">{error}</p>;
  if (loading || !d) return <><h1>Dashboard</h1><div className="stats">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} style={{ height: 88 }} />)}</div></>;

  const max = Math.max(...d.ultimosDias.map((x) => x.valor), 1);

  return (
    <>
      <header className="admin__head"><h1>Dashboard</h1><small>Atualiza automaticamente a cada 20 s</small></header>

      <div className="stats">
        <Stat icon={ClipboardList} label="Total de pedidos" value={d.totalPedidos} />
        <Stat icon={Clock} label="Pendentes" value={d.pedidosPendentes} tone={d.pedidosPendentes ? 'is-alert' : ''} />
        <Stat icon={ChefHat} label="Em preparação / entrega" value={d.pedidosEmPreparacao} />
        <Stat icon={CheckCircle2} label="Concluídos" value={d.pedidosConcluidos} />
        <Stat icon={Wallet} label="Faturamento (concluídos)" value={brl(d.faturamento)} tone="is-money" />
      </div>
      <p className="muted">Em aberto (ainda não concluídos): <strong>{brl(d.emAberto)}</strong> · Cancelados: {d.pedidosCancelados}</p>

      <div className="admin-grid">
        <section className="card">
          <h2>Vendas nos últimos 7 dias</h2>
          <div className="bars" role="img" aria-label="Gráfico de vendas dos últimos 7 dias">
            {d.ultimosDias.map((x) => (
              <div key={x.data} className="bars__col" title={`${x.pedidos} pedido(s) — ${brl(x.valor)}`}>
                <span className="bars__val">{x.valor ? brl(x.valor).replace(/\s/g, '') : ''}</span>
                <div className="bars__bar" style={{ height: `${(x.valor / max) * 100}%` }} />
                <small>{new Date(`${x.data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Produtos mais vendidos</h2>
          {d.maisVendidos.length === 0 ? <p className="muted">Ainda não há vendas.</p> : (
            <ol className="ranking">
              {d.maisVendidos.map((p, i) => (
                <li key={p.nome}><b>{i + 1}</b><span>{p.nome}</span><em>{p.quantidade} un.</em><strong>{brl(p.receita)}</strong></li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="quick">
        <Link to="/admin/mensagens" className="card quick__item"><Inbox size={20} /> {d.mensagensNaoLidas} mensagem(ns) não lida(s)</Link>
        <Link to="/admin/mensagens" className="card quick__item"><MessageSquareQuote size={20} /> {d.avaliacoesPendentes} avaliação(ões) aguardando moderação</Link>
      </div>
    </>
  );
}
