import { useEffect, useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { Field, SmartImage } from '../../components/ui';
import { PAGAMENTO_LABEL, TIPO_LABEL } from '../../services/format';

const num = (v) => Number(String(v ?? '').replace(',', '.')) || 0;

function ChangePassword() {
  const toast = useToast();
  const [f, setF] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (f.novaSenha.length < 8 || !/[A-Za-z]/.test(f.novaSenha) || !/\d/.test(f.novaSenha)) return setErro('A nova senha deve ter ao menos 8 caracteres, com letras e números.');
    if (f.novaSenha !== f.confirmar) return setErro('A confirmação não confere com a nova senha.');
    setSalvando(true);
    setErro('');
    try {
      await api.alterarSenha({ senhaAtual: f.senhaAtual, novaSenha: f.novaSenha });
      toast.success('Senha alterada com sucesso.');
      setF({ senhaAtual: '', novaSenha: '', confirmar: '' });
    } catch (err) {
      setErro(err.message + (err.details?.length ? `: ${err.details.join('; ')}` : ''));
    } finally { setSalvando(false); }
  };

  return (
    <form onSubmit={enviar} noValidate className="card admin-form" style={{ maxWidth: 900, marginTop: 18 }}>
      <h2>Segurança: alterar senha</h2>
      <div className="form-row form-row--3">
        <Field label="Senha atual" id="pw-atual"><input id="pw-atual" type="password" autoComplete="current-password" value={f.senhaAtual} onChange={(e) => setF({ ...f, senhaAtual: e.target.value })} /></Field>
        <Field label="Nova senha" id="pw-nova"><input id="pw-nova" type="password" autoComplete="new-password" value={f.novaSenha} onChange={(e) => setF({ ...f, novaSenha: e.target.value })} /></Field>
        <Field label="Confirmar nova senha" id="pw-conf"><input id="pw-conf" type="password" autoComplete="new-password" value={f.confirmar} onChange={(e) => setF({ ...f, confirmar: e.target.value })} /></Field>
      </div>
      {erro && <p className="alert alert--error" role="alert">{erro}</p>}
      <button className="btn btn--outline" disabled={salvando}>{salvando ? 'SALVANDO...' : 'ALTERAR SENHA'}</button>
    </form>
  );
}

export default function AdminConfig() {
  const { settings, reload } = useSettings();
  const toast = useToast();
  const [f, setF] = useState(null);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (settings && !f) {
      setF({
        ...settings,
        taxaEntregaPadrao: String(settings.taxaEntregaPadrao),
        entregaGratisAcimaDe: String(settings.entregaGratisAcimaDe || 0),
        pedidoMinimo: String(settings.pedidoMinimo || 0),
        taxasPorBairro: settings.taxasPorBairro.map((t) => ({ bairro: t.bairro, taxa: String(t.taxa) })),
      });
    }
  }, [settings, f]);

  if (!f) return <p>Carregando...</p>;
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const upload = async (file) => {
    if (!file) return;
    try { const r = await api.upload(file); setF((x) => ({ ...x, logo: r.url })); toast.success('Logotipo enviado. Clique em salvar para aplicar.'); } catch (e) { toast.error(e.message); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.nome.trim().length < 2) er.nome = 'Informe o nome do restaurante.';
    const wa = f.whatsapp.replace(/\D/g, '');
    if (wa && (wa.length < 12 || wa.length > 13)) er.whatsapp = 'Use DDI + DDD + número (ex.: 55 + DDD + número).';
    if (f.taxasPorBairro.some((t) => !t.bairro.trim())) er.taxas = 'Informe o nome de todos os bairros.';
    setErros(er);
    if (Object.keys(er).length) return toast.error('Confira os campos destacados.');

    const { pratoDoDiaProduto, _id, createdAt, updatedAt, chave, ...resto } = f;
    const body = {
      ...resto,
      pratoDoDia: f.pratoDoDia && typeof f.pratoDoDia === 'object' ? f.pratoDoDia._id : f.pratoDoDia || null,
      taxaEntregaPadrao: num(f.taxaEntregaPadrao),
      entregaGratisAcimaDe: num(f.entregaGratisAcimaDe),
      pedidoMinimo: num(f.pedidoMinimo),
      taxasPorBairro: f.taxasPorBairro.map((t) => ({ bairro: t.bairro.trim(), taxa: num(t.taxa) })),
    };
    setSalvando(true);
    try {
      await api.salvarConfiguracoes(body);
      await reload();
      toast.success('Configurações salvas.');
    } catch (err) {
      toast.error(err.message + (err.details?.length ? `: ${err.details.join('; ')}` : ''));
    } finally { setSalvando(false); }
  };

  const toggle = (grupo, k) => (e) => setF((x) => ({ ...x, [grupo]: { ...x[grupo], [k]: e.target.checked } }));

  return (
    <>
    <form onSubmit={salvar} noValidate className="admin-form admin-form--page">
      <header className="admin__head"><h1>Configurações do restaurante</h1><button className="btn btn--primary" disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</button></header>

      <section className="card">
        <h2>Identidade</h2>
        <div className="form-row">
          <Field label="Nome *" id="s-nome" error={erros.nome}><input id="s-nome" value={f.nome} onChange={set('nome')} maxLength={60} /></Field>
          <Field label="Slogan" id="s-slogan"><input id="s-slogan" value={f.slogan} onChange={set('slogan')} maxLength={100} /></Field>
        </div>
        <Field label="Descrição" id="s-desc"><textarea id="s-desc" rows={3} value={f.descricao} onChange={set('descricao')} maxLength={500} /></Field>
        <Field label="Logotipo" id="s-logo" hint="Deixe vazio para usar o logotipo padrão.">
          <div className="img-input">
            {f.logo && <SmartImage src={f.logo} alt="Logotipo" className="img-input__preview" />}
            <input id="s-logo" value={f.logo} onChange={set('logo')} placeholder="https://... ou /uploads/..." />
            <label className="btn btn--outline btn--sm"><Upload size={14} /> ENVIAR<input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} /></label>
          </div>
        </Field>
      </section>

      <section className="card">
        <h2>Contato e localização</h2>
        <div className="form-row">
          <Field label="Endereço" id="s-end"><input id="s-end" value={f.endereco} onChange={set('endereco')} maxLength={150} /></Field>
          <Field label="Cidade / UF" id="s-cid"><input id="s-cid" value={f.cidade} onChange={set('cidade')} maxLength={80} /></Field>
        </div>
        <div className="form-row">
          <Field label="Telefone" id="s-tel"><input id="s-tel" value={f.telefone} onChange={set('telefone')} maxLength={25} /></Field>
          <Field label="WhatsApp" id="s-wa" error={erros.whatsapp} hint="Somente números com DDI e DDD. Se vazio, o botão do WhatsApp fica oculto."><input id="s-wa" value={f.whatsapp} onChange={set('whatsapp')} placeholder="55DDDNUMERO" inputMode="numeric" /></Field>
        </div>
        <div className="form-row">
          <Field label="Instagram" id="s-ig"><input id="s-ig" value={f.instagram} onChange={set('instagram')} placeholder="@seurestaurante" maxLength={60} /></Field>
          <Field label="E-mail" id="s-email"><input id="s-email" type="email" value={f.email} onChange={set('email')} /></Field>
        </div>
        <Field label="URL de incorporação do Google Maps (opcional)" id="s-mapa" hint="Se vazio, o mapa é gerado a partir do endereço."><input id="s-mapa" value={f.mapaUrl} onChange={set('mapaUrl')} placeholder="https://www.google.com/maps/embed?pb=..." /></Field>
      </section>

      <section className="card">
        <h2>Horário de funcionamento</h2>
        {f.horarios.map((h, i) => (
          <div className="hours-edit" key={i}>
            <input aria-label="Dia(s)" value={h.dia} onChange={(e) => setF((x) => ({ ...x, horarios: x.horarios.map((y, j) => (j === i ? { ...y, dia: e.target.value } : y)) }))} />
            <input aria-label="Abre" type="time" value={h.abre} disabled={h.fechado} onChange={(e) => setF((x) => ({ ...x, horarios: x.horarios.map((y, j) => (j === i ? { ...y, abre: e.target.value } : y)) }))} />
            <input aria-label="Fecha" type="time" value={h.fecha} disabled={h.fechado} onChange={(e) => setF((x) => ({ ...x, horarios: x.horarios.map((y, j) => (j === i ? { ...y, fecha: e.target.value } : y)) }))} />
            <label className="check"><input type="checkbox" checked={h.fechado} onChange={(e) => setF((x) => ({ ...x, horarios: x.horarios.map((y, j) => (j === i ? { ...y, fechado: e.target.checked } : y)) }))} /><span>Fechado</span></label>
            <button type="button" className="icon-btn" aria-label="Remover linha" onClick={() => setF((x) => ({ ...x, horarios: x.horarios.filter((_, j) => j !== i) }))}><X size={16} /></button>
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF((x) => ({ ...x, horarios: [...x.horarios, { dia: '', abre: '11:00', fecha: '22:00', fechado: false }] }))}><Plus size={14} /> Adicionar horário</button>
      </section>

      <section className="card">
        <h2>Pedidos e entrega</h2>
        <div className="form-row form-row--3">
          <Field label="Taxa de entrega padrão (R$)" id="s-taxa"><input id="s-taxa" inputMode="decimal" value={f.taxaEntregaPadrao} onChange={set('taxaEntregaPadrao')} /></Field>
          <Field label="Pedido mínimo (R$)" id="s-min" hint="0 = sem mínimo"><input id="s-min" inputMode="decimal" value={f.pedidoMinimo} onChange={set('pedidoMinimo')} /></Field>
          <Field label="Entrega grátis acima de (R$)" id="s-free" hint="0 = desativado"><input id="s-free" inputMode="decimal" value={f.entregaGratisAcimaDe} onChange={set('entregaGratisAcimaDe')} /></Field>
        </div>
        <h3>Taxas por bairro</h3>
        {f.taxasPorBairro.map((t, i) => (
          <div className="addons-edit__row" key={i}>
            <input aria-label="Bairro" placeholder="Bairro" value={t.bairro} onChange={(e) => setF((x) => ({ ...x, taxasPorBairro: x.taxasPorBairro.map((y, j) => (j === i ? { ...y, bairro: e.target.value } : y)) }))} />
            <input aria-label="Taxa" placeholder="R$ 0,00" inputMode="decimal" value={t.taxa} onChange={(e) => setF((x) => ({ ...x, taxasPorBairro: x.taxasPorBairro.map((y, j) => (j === i ? { ...y, taxa: e.target.value } : y)) }))} />
            <button type="button" className="icon-btn" aria-label="Remover bairro" onClick={() => setF((x) => ({ ...x, taxasPorBairro: x.taxasPorBairro.filter((_, j) => j !== i) }))}><X size={16} /></button>
          </div>
        ))}
        {erros.taxas && <small className="field__error">{erros.taxas}</small>}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF((x) => ({ ...x, taxasPorBairro: [...x.taxasPorBairro, { bairro: '', taxa: '' }] }))}><Plus size={14} /> Adicionar bairro</button>

        <div className="form-row" style={{ marginTop: 20 }}>
          <fieldset className="options"><legend>Tipos de pedido aceitos</legend>
            {Object.keys(TIPO_LABEL).map((k) => <label className="check" key={k}><input type="checkbox" checked={f.tiposPedido[k]} onChange={toggle('tiposPedido', k)} /><span>{TIPO_LABEL[k]}</span></label>)}
          </fieldset>
          <fieldset className="options"><legend>Formas de pagamento</legend>
            {Object.keys(PAGAMENTO_LABEL).map((k) => <label className="check" key={k}><input type="checkbox" checked={f.pagamentos[k]} onChange={toggle('pagamentos', k)} /><span>{PAGAMENTO_LABEL[k]}</span></label>)}
          </fieldset>
        </div>
        <Field label="Chave Pix (exibida ao cliente que escolher Pix)" id="s-pix"><input id="s-pix" value={f.chavePix} onChange={set('chavePix')} maxLength={100} /></Field>
      </section>
    </form>
    <ChangePassword />
    </>
  );
}
