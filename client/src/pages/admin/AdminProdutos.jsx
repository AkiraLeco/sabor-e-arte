import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, X, Star } from 'lucide-react';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { Field, Modal, SmartImage, Skeleton } from '../../components/ui';
import { brl } from '../../services/format';

const VAZIO = {
  nome: '', categoria: '', preco: '', descricao: '', descricaoCompleta: '', imagem: '',
  disponivel: true, emPromocao: false, precoPromocional: '', promocaoAte: '', etiqueta: '',
  ingredientes: '', adicionais: [],
};

const toForm = (p) => ({
  ...VAZIO, ...p,
  categoria: p.categoria?._id || p.categoria || '',
  preco: String(p.preco),
  precoPromocional: p.precoPromocional != null ? String(p.precoPromocional) : '',
  promocaoAte: p.promocaoAte ? p.promocaoAte.slice(0, 10) : '',
  ingredientes: (p.ingredientes || []).join(', '),
  adicionais: (p.adicionais || []).map((a) => ({ nome: a.nome, preco: String(a.preco) })),
});

const num = (v) => Number(String(v).replace(',', '.'));

export default function AdminProdutos() {
  const toast = useToast();
  const { settings, reload: reloadSettings } = useSettings();
  const prods = useFetch(() => api.produtos());
  const cats = useFetch(() => api.categorias({ todas: true }));
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [edit, setEdit] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoImg, setEnviandoImg] = useState(false);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (prods.data || []).filter((p) => (!cat || p.categoria?._id === cat) && (!t || p.nome.toLowerCase().includes(t)));
  }, [prods.data, q, cat]);

  const set = (k) => (e) => setEdit((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const abrir = (p) => { setErros({}); setEdit(p ? toForm(p) : { ...VAZIO, categoria: cats.data?.[0]?._id || '' }); };

  const upload = async (file) => {
    if (!file) return;
    setEnviandoImg(true);
    try {
      const r = await api.upload(file);
      setEdit((f) => ({ ...f, imagem: r.url }));
      toast.success('Imagem enviada.');
    } catch (e) { toast.error(e.message); } finally { setEnviandoImg(false); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    const er = {};
    if (edit.nome.trim().length < 2) er.nome = 'Informe o nome.';
    if (!edit.categoria) er.categoria = 'Escolha uma categoria.';
    if (edit.preco === '' || Number.isNaN(num(edit.preco)) || num(edit.preco) < 0) er.preco = 'Informe um preço válido.';
    if (edit.emPromocao && !(num(edit.precoPromocional) >= 0 && edit.precoPromocional !== '' && num(edit.precoPromocional) < num(edit.preco))) er.precoPromocional = 'O preço promocional deve ser menor que o preço normal.';
    if (edit.adicionais.some((a) => !a.nome.trim() || Number.isNaN(num(a.preco || 0)))) er.adicionais = 'Preencha nome e valor de todos os adicionais.';
    setErros(er);
    if (Object.keys(er).length) return;

    const body = {
      nome: edit.nome.trim(),
      categoria: edit.categoria,
      preco: num(edit.preco),
      descricao: edit.descricao.trim(),
      descricaoCompleta: edit.descricaoCompleta.trim(),
      imagem: edit.imagem.trim(),
      disponivel: edit.disponivel,
      emPromocao: edit.emPromocao,
      precoPromocional: edit.emPromocao ? num(edit.precoPromocional) : null,
      promocaoAte: edit.emPromocao && edit.promocaoAte ? new Date(`${edit.promocaoAte}T23:59:59`).toISOString() : null,
      etiqueta: edit.etiqueta.trim(),
      ingredientes: edit.ingredientes.split(',').map((s) => s.trim()).filter(Boolean),
      adicionais: edit.adicionais.map((a) => ({ nome: a.nome.trim(), preco: num(a.preco || 0) })),
    };
    setSalvando(true);
    try {
      await api.salvarProduto(edit._id, body);
      toast.success(edit._id ? 'Produto atualizado.' : 'Produto cadastrado.');
      setEdit(null);
      prods.refresh();
    } catch (err) {
      toast.error(err.message + (err.details?.length ? `: ${err.details.join('; ')}` : ''));
    } finally { setSalvando(false); }
  };

  const excluir = async (p) => {
    if (!window.confirm(`Excluir "${p.nome}"? Esta ação não pode ser desfeita.`)) return;
    try { await api.excluirProduto(p._id); toast.success('Produto excluído.'); prods.refresh(); reloadSettings(); } catch (e) { toast.error(e.message); }
  };

  const alternar = async (p) => {
    try { await api.alternarDisponibilidade(p._id); prods.refresh(); } catch (e) { toast.error(e.message); }
  };

  const pratoDoDia = async (p) => {
    try {
      await api.salvarConfiguracoes({ ...settings, pratoDoDia: settings.pratoDoDia === p._id ? null : p._id });
      await reloadSettings();
      toast.success(settings.pratoDoDia === p._id ? 'Prato do dia removido.' : `"${p.nome}" é o prato do dia.`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <header className="admin__head">
        <h1>Produtos</h1>
        <button className="btn btn--primary" onClick={() => abrir()} disabled={!cats.data?.length}><Plus size={16} /> NOVO PRODUTO</button>
      </header>

      <div className="admin-filters">
        <div className="search"><Search size={18} aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto" aria-label="Buscar produto" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {cats.data?.map((c) => <option key={c._id} value={c._id}>{c.nome}</option>)}
        </select>
      </div>

      {prods.loading ? <Skeleton style={{ height: 260 }} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Promoção</th><th>Disponível</th><th><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan={6} className="table__empty">Nenhum produto encontrado.</td></tr>}
              {lista.map((p) => (
                <tr key={p._id}>
                  <td data-label="Produto"><div className="table__prod"><SmartImage src={p.imagem} alt="" className="table__thumb" /><div><strong>{p.nome}</strong>{settings?.pratoDoDia === p._id && <small className="tag tag--gold">Prato do dia</small>}</div></div></td>
                  <td data-label="Categoria">{p.categoria?.nome}</td>
                  <td data-label="Preço">{brl(p.preco)}</td>
                  <td data-label="Promoção">{p.promocaoVigente ? <span className="tag tag--promo">{brl(p.precoPromocional)}</span> : p.emPromocao ? <span className="tag">Expirada</span> : '—'}</td>
                  <td data-label="Disponível">
                    <label className="switch"><input type="checkbox" checked={p.disponivel} onChange={() => alternar(p)} aria-label={`${p.nome} disponível`} /><span /></label>
                  </td>
                  <td className="table__actions">
                    <button className="icon-btn" onClick={() => pratoDoDia(p)} aria-label="Definir como prato do dia" title="Prato do dia"><Star size={18} fill={settings?.pratoDoDia === p._id ? 'currentColor' : 'none'} /></button>
                    <button className="icon-btn" onClick={() => abrir(p)} aria-label={`Editar ${p.nome}`}><Pencil size={18} /></button>
                    <button className="icon-btn icon-btn--danger" onClick={() => excluir(p)} aria-label={`Excluir ${p.nome}`}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} label="Produto" className="form-modal">
        {edit && (
          <form onSubmit={salvar} noValidate className="admin-form">
            <h2>{edit._id ? 'Editar produto' : 'Novo produto'}</h2>
            <div className="form-row">
              <Field label="Nome *" id="f-nome" error={erros.nome}><input id="f-nome" value={edit.nome} onChange={set('nome')} maxLength={100} /></Field>
              <Field label="Categoria *" id="f-cat" error={erros.categoria}>
                <select id="f-cat" value={edit.categoria} onChange={set('categoria')}>{cats.data?.map((c) => <option key={c._id} value={c._id}>{c.nome}</option>)}</select>
              </Field>
            </div>
            <div className="form-row">
              <Field label="Preço (R$) *" id="f-preco" error={erros.preco}><input id="f-preco" inputMode="decimal" value={edit.preco} onChange={set('preco')} /></Field>
              <Field label="Etiqueta (opcional)" id="f-etq" hint="Ex.: Novo, Chef recomenda"><input id="f-etq" value={edit.etiqueta} onChange={set('etiqueta')} maxLength={30} /></Field>
            </div>
            <Field label="Descrição curta" id="f-desc"><textarea id="f-desc" rows={2} value={edit.descricao} onChange={set('descricao')} maxLength={400} /></Field>
            <Field label="Descrição completa (exibida no modal)" id="f-dc"><textarea id="f-dc" rows={3} value={edit.descricaoCompleta} onChange={set('descricaoCompleta')} maxLength={1500} /></Field>

            <Field label="Imagem" id="f-img" hint="Cole uma URL ou envie um arquivo (JPG, PNG, WEBP; até 3 MB).">
              <div className="img-input">
                {edit.imagem && <SmartImage src={edit.imagem} alt="Prévia" className="img-input__preview" />}
                <input id="f-img" value={edit.imagem} onChange={set('imagem')} placeholder="https://... ou /uploads/..." />
                <label className="btn btn--outline btn--sm"><Upload size={14} /> {enviandoImg ? 'ENVIANDO...' : 'ENVIAR'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => upload(e.target.files[0])} /></label>
              </div>
            </Field>

            <Field label="Ingredientes removíveis" id="f-ing" hint="Separados por vírgula. O cliente poderá pedir “sem” cada um."><input id="f-ing" value={edit.ingredientes} onChange={set('ingredientes')} placeholder="Cebola, Tomate, Picles" /></Field>

            <fieldset className="addons-edit">
              <legend>Adicionais</legend>
              {edit.adicionais.map((a, i) => (
                <div className="addons-edit__row" key={i}>
                  <input aria-label="Nome do adicional" placeholder="Nome" value={a.nome} onChange={(e) => setEdit((f) => ({ ...f, adicionais: f.adicionais.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) }))} maxLength={60} />
                  <input aria-label="Valor do adicional" placeholder="R$ 0,00" inputMode="decimal" value={a.preco} onChange={(e) => setEdit((f) => ({ ...f, adicionais: f.adicionais.map((x, j) => (j === i ? { ...x, preco: e.target.value } : x)) }))} />
                  <button type="button" className="icon-btn" onClick={() => setEdit((f) => ({ ...f, adicionais: f.adicionais.filter((_, j) => j !== i) }))} aria-label="Remover adicional"><X size={16} /></button>
                </div>
              ))}
              {erros.adicionais && <small className="field__error">{erros.adicionais}</small>}
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEdit((f) => ({ ...f, adicionais: [...f.adicionais, { nome: '', preco: '' }] }))}><Plus size={14} /> Adicionar adicional</button>
            </fieldset>

            <div className="form-row form-row--checks">
              <label className="check"><input type="checkbox" checked={edit.disponivel} onChange={set('disponivel')} /><span>Disponível para pedido</span></label>
              <label className="check"><input type="checkbox" checked={edit.emPromocao} onChange={set('emPromocao')} /><span>Em promoção</span></label>
            </div>
            {edit.emPromocao && (
              <div className="form-row">
                <Field label="Preço promocional (R$) *" id="f-pp" error={erros.precoPromocional}><input id="f-pp" inputMode="decimal" value={edit.precoPromocional} onChange={set('precoPromocional')} /></Field>
                <Field label="Válida até (opcional)" id="f-pa" hint="Oferta limitada: deixe vazio para não expirar."><input id="f-pa" type="date" value={edit.promocaoAte} onChange={set('promocaoAte')} /></Field>
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEdit(null)}>CANCELAR</button>
              <button className="btn btn--primary" disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR PRODUTO'}</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
