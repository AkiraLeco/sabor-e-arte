import { useState } from 'react';
import { MapPin, Phone, MessageCircle, Instagram, Clock, Mail, Send } from 'lucide-react';
import { Field, Reveal, SectionTitle } from '../ui';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { whatsappLink } from '../../services/whatsapp';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VAZIO = { nome: '', email: '', telefone: '', assunto: '', mensagem: '' };

export default function Contact() {
  const { settings: s } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!s) return null;
  const insta = s.instagram?.replace('@', '');
  const mapa = s.mapaUrl || `https://www.google.com/maps?q=${encodeURIComponent(`${s.endereco}, ${s.cidade}`)}&output=embed`;

  const enviar = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.nome.trim().length < 2) er.nome = 'Informe seu nome.';
    if (!EMAIL_RX.test(form.email.trim())) er.email = 'Informe um e-mail válido.';
    if (form.mensagem.trim().length < 10) er.mensagem = 'A mensagem deve ter ao menos 10 caracteres.';
    setErros(er);
    if (Object.keys(er).length) return;
    setEnviando(true);
    try {
      const r = await api.enviarContato({ ...form, nome: form.nome.trim(), email: form.email.trim(), mensagem: form.mensagem.trim() });
      toast.success(r.mensagem);
      setForm(VAZIO);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <section id="localizacao" className="section" aria-labelledby="loc-title">
        <div className="container">
          <SectionTitle eyebrow="Localização" title="Venha nos visitar" subtitle="Estamos prontos para receber você, ou levar o sabor até sua casa." />
          <h2 id="loc-title" className="sr-only">Localização</h2>
          <div className="location">
            <Reveal className="location__info">
              <ul>
                <li><MapPin aria-hidden="true" /><div><strong>Endereço</strong><span>{s.endereco}<br />{s.cidade}</span></div></li>
                {s.telefone && <li><Phone aria-hidden="true" /><div><strong>Telefone</strong><a href={`tel:${s.telefone.replace(/\D/g, '')}`}>{s.telefone}</a></div></li>}
                {s.whatsapp && <li><MessageCircle aria-hidden="true" /><div><strong>WhatsApp</strong><a href={whatsappLink(s.whatsapp)} target="_blank" rel="noreferrer">Chamar no WhatsApp</a></div></li>}
                {insta && <li><Instagram aria-hidden="true" /><div><strong>Instagram</strong><a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer">@{insta}</a></div></li>}
                {s.email && <li><Mail aria-hidden="true" /><div><strong>E-mail</strong><a href={`mailto:${s.email}`}>{s.email}</a></div></li>}
                <li>
                  <Clock aria-hidden="true" />
                  <div>
                    <strong>Horários de funcionamento</strong>
                    <table className="hours">
                      <tbody>
                        {s.horarios.map((h) => (
                          <tr key={h.dia}><th scope="row">{h.dia}</th><td>{h.fechado ? 'Fechado' : `${h.abre} às ${h.fecha}`}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </li>
              </ul>
            </Reveal>
            <Reveal className="location__map" delay={0.1}>
              <iframe title={`Mapa: ${s.endereco}`} src={mapa} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="contato" className="section section--tint" aria-labelledby="ct-title">
        <div className="container container--narrow">
          <SectionTitle eyebrow="Contato" title="Fale com a gente" subtitle="Dúvidas, sugestões, eventos ou parcerias: envie uma mensagem." />
          <h2 id="ct-title" className="sr-only">Contato</h2>
          <form className="card form-card" onSubmit={enviar} noValidate>
            <div className="form-row">
              <Field label="Nome *" id="ct-nome" error={erros.nome}><input id="ct-nome" value={form.nome} onChange={set('nome')} autoComplete="name" maxLength={80} /></Field>
              <Field label="E-mail *" id="ct-email" error={erros.email}><input id="ct-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" /></Field>
            </div>
            <div className="form-row">
              <Field label="Telefone" id="ct-tel"><input id="ct-tel" type="tel" value={form.telefone} onChange={set('telefone')} autoComplete="tel" maxLength={20} /></Field>
              <Field label="Assunto" id="ct-ass"><input id="ct-ass" value={form.assunto} onChange={set('assunto')} maxLength={120} /></Field>
            </div>
            <Field label="Mensagem *" id="ct-msg" error={erros.mensagem}><textarea id="ct-msg" rows={5} value={form.mensagem} onChange={set('mensagem')} maxLength={2000} /></Field>
            <button className="btn btn--primary btn--lg" disabled={enviando}><Send size={18} /> {enviando ? 'ENVIANDO...' : 'ENVIAR MENSAGEM'}</button>
          </form>
        </div>
      </section>
    </>
  );
}
