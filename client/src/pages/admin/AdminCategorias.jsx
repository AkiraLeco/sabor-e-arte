import { useState } from 'react';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, Skeleton } from '../../components/ui';

export default function AdminCategorias() {
  const toast = useToast();
  const { data, setData, loading, refresh } = useFetch(() => api.categorias({ todas: true }));
  const [edit, setEdit] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const mover = async (i, d) => {
    const lista = [...data];
    const j = i + d;
    if (j < 0 || j >= lista.length) return;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    setData(lista); // otimista
    try { await api.reordenarCategorias(lista.map((c) => c._id)); } catch (e) { toast.error(e.message); refresh(); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (edit.nome.trim().length < 2) return setErro('Informe o nome da categoria.');
    setSalvando(true);
    setErro('');
    try {
      await api.salvarCategoria(edit._id, { nome: edit.nome.trim(), descricao: edit.descricao.trim(), ativa: edit.ativa });
      toast.success(edit._id ? 'Categoria atualizada.' : 'Categoria criada.');
      setEdit(null);
      refresh();
    } catch (err) { setErro(err.message); } finally { setSalvando(false); }
  };

  const excluir = async (c) => {
    if (!window.confirm(`Excluir a categoria "${c.nome}"?`)) return;
    try { await api.excluirCategoria(c._id); toast.success('Categoria excluída.'); refresh(); } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <header className="admin__head">
        <h1>Categorias</h1>
        <button className="btn btn--primary" onClick={() => { setErro(''); setEdit({ nome: '', descricao: '', ativa: true }); }}><Plus size={16} /> NOVA CATEGORIA</button>
      </header>
      <p className="muted">A ordem abaixo é a ordem exibida no cardápio do site.</p>

      {loading ? <Skeleton style={{ height: 240 }} /> : (
        <ul className="cat-list">
          {data?.map((c, i) => (
            <li key={c._id} className={c.ativa ? '' : 'is-off'}>
              <div className="cat-list__order">
                <button className="icon-btn" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Mover ${c.nome} para cima`}><ArrowUp size={16} /></button>
                <button className="icon-btn" onClick={() => mover(i, 1)} disabled={i === data.length - 1} aria-label={`Mover ${c.nome} para baixo`}><ArrowDown size={16} /></button>
              </div>
              <div className="cat-list__info"><strong>{c.nome}</strong><small>{c.descricao || 'Sem descrição'}{!c.ativa && ' · Oculta no site'}</small></div>
              <button className="icon-btn" onClick={() => { setErro(''); setEdit({ ...c }); }} aria-label={`Editar ${c.nome}`}><Pencil size={18} /></button>
              <button className="icon-btn icon-btn--danger" onClick={() => excluir(c)} aria-label={`Excluir ${c.nome}`}><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} label="Categoria" className="form-modal form-modal--sm">
        {edit && (
          <form onSubmit={salvar} noValidate className="admin-form">
            <h2>{edit._id ? 'Editar categoria' : 'Nova categoria'}</h2>
            <Field label="Nome *" id="cat-nome" error={erro}><input id="cat-nome" value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} maxLength={60} autoFocus /></Field>
            <Field label="Descrição" id="cat-desc"><input id="cat-desc" value={edit.descricao} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} maxLength={200} /></Field>
            <label className="check"><input type="checkbox" checked={edit.ativa} onChange={(e) => setEdit({ ...edit, ativa: e.target.checked })} /><span>Visível no cardápio</span></label>
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEdit(null)}>CANCELAR</button>
              <button className="btn btn--primary" disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR'}</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
