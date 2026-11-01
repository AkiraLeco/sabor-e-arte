import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Logo } from './ui';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

const LINKS = [
  { to: '/#inicio', label: 'Início' },
  { to: '/#sobre', label: 'Sobre nós' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/#promocoes', label: 'Promoções' },
  { to: '/#localizacao', label: 'Localização' },
  { to: '/#contato', label: 'Contato' },
];

export default function Header() {
  const { settings } = useSettings();
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const solid = scrolled || menu || location.pathname !== '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenu(false), [location]);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menu]);

  return (
    <header className={`header${solid ? ' is-solid' : ''}`}>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <div className="container header__bar">
        <Link to="/" className="header__logo" aria-label={`${settings?.nome || 'Restaurante'} - página inicial`}>
          <Logo settings={settings} light={!solid} />
        </Link>

        <nav className="header__nav" aria-label="Principal">
          {LINKS.map((l) =>
            l.to === '/cardapio' ? (
              <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
            ) : (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            )
          )}
        </nav>

        <div className="header__actions">
          <button className="icon-btn header__cart" onClick={() => setOpen(true)} aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}>
            <ShoppingBag size={22} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span key={count} className="badge" initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <Link to="/cardapio" className="btn btn--gold header__cta">FAÇA SEU PEDIDO</Link>
          <button className="icon-btn header__burger" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? 'Fechar menu' : 'Abrir menu'}>
            {menu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            className="mobile-menu"
            aria-label="Menu mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {LINKS.map((l, i) => (
              <motion.div key={l.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                <Link to={l.to}>{l.label}</Link>
              </motion.div>
            ))}
            <Link to="/cardapio" className="btn btn--gold btn--block">FAÇA SEU PEDIDO</Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
