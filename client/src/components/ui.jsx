import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, X, Minus, Plus, ImageOff } from 'lucide-react';

export function Logo({ settings, light = false }) {
  const nome = settings?.nome || 'Sabor & Arte';
  return (
    <span className={`logo${light ? ' logo--light' : ''}`}>
      {settings?.logo ? (
        <img src={settings.logo} alt="" className="logo__img" />
      ) : (
        <svg className="logo__mark" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="27" r="13" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M9 27h30" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M24 14v-3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="24" cy="8.5" r="2.2" fill="currentColor" />
        </svg>
      )}
      <span className="logo__text">
        <strong>{nome}</strong>
        <small>{settings?.slogan || 'Cozinha brasileira autoral'}</small>
      </span>
    </span>
  );
}

// Imagem com lazy loading, esqueleto enquanto carrega e fallback elegante em caso de erro
export function SmartImage({ src, alt = '', className = '', eager = false, ...rest }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  useEffect(() => setState(src ? 'loading' : 'error'), [src]);
  return (
    <span className={`smart-img ${className} is-${state}`}>
      {state === 'error' ? (
        <span className="smart-img__fallback" role="img" aria-label={alt || 'Imagem indisponível'}>
          <ImageOff size={28} aria-hidden="true" />
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          {...rest}
        />
      )}
    </span>
  );
}

export function Stars({ value = 0, size = 16 }) {
  return (
    <span className="stars" role="img" aria-label={`Nota ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? 'on' : ''} aria-hidden="true" />
      ))}
    </span>
  );
}

// Aparece suavemente ao entrar na viewport (respeita prefers-reduced-motion via MotionConfig)
export function Reveal({ children, delay = 0, y = 24, as = 'div', className, ...rest }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, center = true, light = false }) {
  return (
    <Reveal className={`section-title${center ? ' is-center' : ''}${light ? ' is-light' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </Reveal>
  );
}

export function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function ProductSkeletons({ n = 6 }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Carregando pratos">
      {Array.from({ length: n }, (_, i) => (
        <div className="product-card product-card--skeleton" key={i}>
          <Skeleton className="sk-img" />
          <div className="product-card__body">
            <Skeleton className="sk-line sk-w60" />
            <Skeleton className="sk-line" />
            <Skeleton className="sk-line sk-w80" />
            <Skeleton className="sk-btn" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function QtyStepper({ value, onChange, min = 1, max = 50, label = 'Quantidade' }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir quantidade">
        <Minus size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade">
        <Plus size={16} />
      </button>
    </div>
  );
}

// Modal acessível: ESC fecha, bloqueia rolagem do fundo, devolve o foco ao fechar
export function Modal({ open, onClose, label, children, className = '', side = false }) {
  const ref = useRef(null);
  // onClose costuma ser uma função inline (nova a cada render): guardamos em ref para o efeito
  // rodar só quando `open` mudar. Caso contrário o foco seria "roubado" a cada tecla digitada.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`overlay${side ? ' overlay--side' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`${side ? 'drawer' : 'modal'} ${className}`}
            initial={side ? { x: '100%' } : { opacity: 0, y: 40, scale: 0.97 }}
            animate={side ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={side ? { x: '100%' } : { opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <button className="icon-btn modal__close" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="empty">
      {Icon && <Icon size={44} aria-hidden="true" />}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Field({ label, error, hint, children, id }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <small className="field__hint">{hint}</small>}
      {error && <small className="field__error" role="alert">{error}</small>}
    </div>
  );
}
