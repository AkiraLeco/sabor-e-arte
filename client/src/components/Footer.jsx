import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Logo } from './ui';
import { useSettings } from '../context/SettingsContext';
import { whatsappLink } from '../services/whatsapp';

export default function Footer() {
  const { settings: s } = useSettings();
  const insta = s?.instagram?.replace('@', '');
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo settings={s} light />
          <p className="footer__about">{s?.descricao}</p>
        </div>
        <div>
          <h3>Navegue</h3>
          <ul>
            <li><Link to="/cardapio">Cardápio digital</Link></li>
            <li><Link to="/#promocoes">Promoções</Link></li>
            <li><Link to="/#sobre">Sobre nós</Link></li>
            <li><Link to="/pedido">Acompanhar pedido</Link></li>
          </ul>
        </div>
        <div>
          <h3>Fale conosco</h3>
          <ul>
            {s?.endereco && <li><MapPin size={16} aria-hidden="true" /> {s.endereco}{s.cidade ? ` - ${s.cidade}` : ''}</li>}
            {s?.telefone && <li><Phone size={16} aria-hidden="true" /> {s.telefone}</li>}
            {s?.whatsapp && <li><MessageCircle size={16} aria-hidden="true" /> <a href={whatsappLink(s.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a></li>}
            {insta && <li><Instagram size={16} aria-hidden="true" /> <a href={`https://instagram.com/${insta}`} target="_blank" rel="noreferrer">@{insta}</a></li>}
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {s?.nome}. Todos os direitos reservados.</span>
        <Link to="/admin">Área administrativa</Link>
      </div>
    </footer>
  );
}
