import { useState } from 'react';
import { Mail, MailOpen, Trash2, Check, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Stars, Skeleton } from '../../components/ui';
import { formatDateTime } from '../../services/format';

export default function AdminMensagens() {
  const toast = useToast();
  const [aba, setAba] = useState('mensagens');
  const msgs = useFetch(() => api.mensagens(), [], { interval: 30000 });
  const revs = useFetch(() => api.avaliacoesAdmin());

  const run = async (fn, ok, after) => {
    try { await fn(); if (ok) toast.success(ok); after.refresh(); } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <header className="admin__head"><h1>Mensagens e avaliações</h1></header>
      <div className="chips" role="tablist">
        <button role="tab" aria-selected={aba === 'mensagens'} className={`chip${aba === 'mensagens' ? ' is-active' : ''}`} onClick={() => setAba('mensagens')}>Mensagens de contato {msgs.data?.some((m) => !m.lida) && '•'}</button>
        <button role="tab" aria-selected={aba === 'avaliacoes'} className={`chip${aba === 'avaliacoes' ? ' is-active' : ''}`} onClick={() => setAba('avaliacoes')}>Avaliações {revs.data?.some((r) => !r.aprovada) && '•'}</button>
      </div>

      {aba === 'mensagens' && (msgs.loading ? <Skeleton style={{ height: 200 }} /> : (
        <ul className="inbox">
          {msgs.data?.length === 0 && <li className="table__empty">Nenhuma mensagem recebida.</li>}
          {msgs.data?.map((m) => (
            <li key={m._id} className={`card inbox__item${m.lida ? '' : ' is-unread'}`}>
              <header>
                <div>{m.lida ? <MailOpen size={16} /> : <Mail size={16} />} <strong>{m.nome}</strong> <a href={`mailto:${m.email}`}>{m.email}</a>{m.telefone && <span> · {m.telefone}</span>}</div>
                <small>{formatDateTime(m.createdAt)}</small>
              </header>
              {m.assunto && <h3>{m.assunto}</h3>}
              <p>{m.mensagem}</p>
              <footer>
                <button className="btn btn--ghost btn--sm" onClick={() => run(() => api.marcarMensagem(m._id, !m.lida), null, msgs)}>{m.lida ? 'Marcar como não lida' : 'Marcar como lida'}</button>
                <button className="icon-btn icon-btn--danger" aria-label="Excluir mensagem" onClick={() => window.confirm('Excluir esta mensagem?') && run(() => api.excluirMensagem(m._id), 'Mensagem excluída.', msgs)}><Trash2 size={16} /></button>
              </footer>
            </li>
          ))}
        </ul>
      ))}

      {aba === 'avaliacoes' && (revs.loading ? <Skeleton style={{ height: 200 }} /> : (
        <ul className="inbox">
          {revs.data?.length === 0 && <li className="table__empty">Nenhuma avaliação.</li>}
          {revs.data?.map((r) => (
            <li key={r._id} className={`card inbox__item${r.aprovada ? '' : ' is-unread'}`}>
              <header><div><strong>{r.nome}</strong> <Stars value={r.nota} size={14} /> {r.demo && <span className="tag tag--demo">Exemplo demonstrativo</span>}</div><small>{formatDateTime(r.createdAt)}</small></header>
              <p>{r.comentario}</p>
              <footer>
                <span className={`tag ${r.aprovada ? 'tag--ok' : 'tag--gold'}`}>{r.aprovada ? 'Publicada' : 'Aguardando aprovação'}</span>
                <button className="btn btn--ghost btn--sm" onClick={() => run(() => api.moderarAvaliacao(r._id, !r.aprovada), r.aprovada ? 'Avaliação ocultada.' : 'Avaliação publicada.', revs)}>{r.aprovada ? <><EyeOff size={14} /> Ocultar</> : <><Check size={14} /> Aprovar e publicar</>}</button>
                <button className="icon-btn icon-btn--danger" aria-label="Excluir avaliação" onClick={() => window.confirm('Excluir esta avaliação?') && run(() => api.excluirAvaliacao(r._id), 'Avaliação excluída.', revs)}><Trash2 size={16} /></button>
              </footer>
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}
