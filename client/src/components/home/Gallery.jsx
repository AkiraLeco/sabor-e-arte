import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Modal, Reveal, SectionTitle, SmartImage } from '../ui';

const u = (id) => `/images/${id}.jpg`; // fotos locais em client/public/images

// Fotos ilustrativas (banco de imagens). Substitua por fotos reais do restaurante.
const FOTOS = [
  { id: '1414235077428-338989a2e8c0', tipo: 'Pratos', alt: 'Prato empratado em mesa posta', wide: true },
  { id: '1568901346375-23c9450c58cd', tipo: 'Pratos', alt: 'Hambúrguer artesanal' },
  { id: '1559339352-11d035aa65de', tipo: 'Ambiente', alt: 'Varanda do restaurante com vista' },
  { id: '1551183053-bf91a1d81141', tipo: 'Pratos', alt: 'Tagliatelle ao ragu' },
  { id: '1551218808-94e220e084d2', tipo: 'Preparo', alt: 'Chef picando ingredientes frescos' },
  { id: '1555396273-367ea4eb4db5', tipo: 'Ambiente', alt: 'Salão interno do restaurante', wide: true },
  { id: '1577219491135-ce391730fb2c', tipo: 'Equipe', alt: 'Chef finalizando um prato' },
  { id: '1578985545062-69928b1d9587', tipo: 'Pratos', alt: 'Bolo de chocolate' },
  { id: '1424847651672-bf20a4b0982b', tipo: 'Eventos', alt: 'Mesa farta para encontros e celebrações' },
  { id: '1544148103-0773bf10d330', tipo: 'Ambiente', alt: 'Mesas do salão em dia de movimento' },
];

const TIPOS = ['Todas', 'Pratos', 'Ambiente', 'Preparo', 'Equipe', 'Eventos'];

export default function Gallery() {
  const [tipo, setTipo] = useState('Todas');
  const [aberta, setAberta] = useState(null);
  const lista = FOTOS.filter((f) => tipo === 'Todas' || f.tipo === tipo);

  const mover = useCallback((d) => setAberta((i) => (i === null ? i : (i + d + lista.length) % lista.length)), [lista.length]);

  useEffect(() => {
    if (aberta === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aberta, mover]);

  const atual = aberta !== null ? lista[aberta] : null;

  return (
    <section id="galeria" className="section" aria-labelledby="gal-title">
      <div className="container">
        <SectionTitle eyebrow="Galeria" title="Um olhar sobre a nossa mesa" subtitle="Pratos, ambiente, preparo, equipe e momentos especiais." />
        <h2 id="gal-title" className="sr-only">Galeria de fotos</h2>

        <div className="chips chips--center" role="tablist" aria-label="Filtrar galeria">
          {TIPOS.map((t) => (
            <button key={t} role="tab" aria-selected={tipo === t} className={`chip${tipo === t ? ' is-active' : ''}`} onClick={() => setTipo(t)}>{t}</button>
          ))}
        </div>

        <div className="gallery">
          {lista.map((f, i) => (
            <Reveal key={f.id} delay={(i % 4) * 0.05} className={`gallery__item${f.wide ? ' is-wide' : ''}`}>
              <button onClick={() => setAberta(i)} aria-label={`Ampliar: ${f.alt}`}>
                <SmartImage src={u(f.id)} alt={f.alt} />
                <span className="gallery__hover"><ZoomIn size={26} /><small>{f.tipo}</small></span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal open={aberta !== null} onClose={() => setAberta(null)} label="Foto ampliada" className="lightbox">
        {atual && (
          <figure className="lightbox__fig">
            <SmartImage src={u(atual.id)} alt={atual.alt} eager />
            <figcaption>{atual.alt} · <span>{aberta + 1}/{lista.length}</span></figcaption>
            <button className="icon-btn lightbox__nav lightbox__nav--prev" onClick={() => mover(-1)} aria-label="Foto anterior"><ChevronLeft size={26} /></button>
            <button className="icon-btn lightbox__nav lightbox__nav--next" onClick={() => mover(1)} aria-label="Próxima foto"><ChevronRight size={26} /></button>
          </figure>
        )}
      </Modal>
    </section>
  );
}
