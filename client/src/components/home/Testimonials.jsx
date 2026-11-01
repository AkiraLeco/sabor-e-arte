import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Send } from 'lucide-react';
import { Field, SectionTitle, Stars } from '../ui';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../services/format';

export default function Testimonials() {
  const { data } = useFetch(() => api.avaliacoes());
  const toast = useToast();
  const lista = data || [];
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [form, setForm] = useState({ nome: '', nota: 5, comentario: '' });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (pausado || lista.length < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % lista.length), 6500);
    return () => clearInterval(t);
  }, [pausado, lista.length]);

  const atual = lista[i % Math.max(lista.length, 1)];
  const go = (d) => setI((x) => (x + d + lista.length) % lista.length);

  const enviar = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.nome.trim().length < 2) er.nome = 'Informe seu nome.';
    if (form.comentario.trim().length < 10) er.comentario = 'Escreva ao menos 10 caracteres.';
    setErros(er);
    if (Object.keys(er).length) return;
    setEnviando(true);
    try {
      const r = await api.enviarAvaliacao({ ...form, nome: form.nome.trim(), comentario: form.comentario.trim() });
      toast.success(r.mensagem);
      setForm({ nome: '', nota: 5, comentario: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="depoimentos" className="section section--tint" aria-labelledby="dep-title">
      <div className="container">
        <SectionTitle eyebrow="Depoimentos" title="O que dizem nossos clientes" />
        <h2 id="dep-title" className="sr-only">Depoimentos</h2>

        {atual && (
          <div className="carousel" onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocus={() => setPausado(true)} onBlur={() => setPausado(false)} role="region" aria-roledescription="carrossel" aria-label="Avaliações de clientes">
            <button className="icon-btn carousel__nav" onClick={() => go(-1)} aria-label="Avaliação anterior" disabled={lista.length < 2}><ChevronLeft /></button>
            <div className="carousel__stage" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.figure key={atual._id} className="review" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
                  <Quote size={32} className="review__quote" aria-hidden="true" />
                  <Stars value={atual.nota} size={20} />
                  <blockquote>{atual.comentario}</blockquote>
                  <figcaption>
                    <strong>{atual.nome}</strong>
                    <span>{formatDate(atual.createdAt)}</span>
                    {atual.demo && <em className="tag tag--demo" title="Texto ilustrativo para demonstração do layout">Exemplo demonstrativo · não é uma avaliação real</em>}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
            <button className="icon-btn carousel__nav" onClick={() => go(1)} aria-label="Próxima avaliação" disabled={lista.length < 2}><ChevronRight /></button>
          </div>
        )}
        {lista.length > 1 && (
          <div className="dots" role="tablist" aria-label="Selecionar avaliação">
            {lista.map((r, idx) => (
              <button key={r._id} role="tab" aria-selected={idx === i} aria-label={`Avaliação ${idx + 1}`} className={idx === i ? 'is-active' : ''} onClick={() => setI(idx)} />
            ))}
          </div>
        )}

        <form className="review-form" onSubmit={enviar} noValidate>
          <h3>Já pediu conosco? Conte sua experiência</h3>
          <p>Sua avaliação é publicada após a análise da nossa equipe.</p>
          <div className="form-row">
            <Field label="Seu nome" id="rv-nome" error={erros.nome}>
              <input id="rv-nome" value={form.nome} maxLength={60} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoComplete="name" />
            </Field>
            <Field label="Nota" id="rv-nota">
              <select id="rv-nota" value={form.nota} onChange={(e) => setForm({ ...form, nota: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
              </select>
            </Field>
          </div>
          <Field label="Comentário" id="rv-com" error={erros.comentario}>
            <textarea id="rv-com" rows={3} maxLength={500} value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} />
          </Field>
          <button className="btn btn--primary" disabled={enviando}><Send size={16} /> {enviando ? 'ENVIANDO...' : 'ENVIAR AVALIAÇÃO'}</button>
        </form>
      </div>
    </section>
  );
}
