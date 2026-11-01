import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, ChefHat, Award, ArrowDown } from 'lucide-react';

const HERO_IMG = '/images/1414235077428-338989a2e8c0.jpg';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

const DESTAQUES = [
  { icon: Leaf, label: 'Ingredientes selecionados' },
  { icon: ChefHat, label: 'Preparação especial' },
  { icon: Award, label: 'Qualidade e sabor' },
];

export default function Hero() {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <img className="hero__bg" src={HERO_IMG} alt="" fetchpriority="high" />
      <div className="hero__shade" />
      <motion.div className="container hero__content" variants={container} initial="hidden" animate="show">
        <motion.span variants={item} className="eyebrow eyebrow--gold">Restaurante · Delivery · Retirada</motion.span>
        <motion.h1 variants={item} id="hero-title">
          UMA EXPERIÊNCIA DE SABOR <em>EM CADA PRATO.</em>
        </motion.h1>
        <motion.p variants={item} className="hero__lead">
          Ingredientes selecionados, preparo especial e sabores que transformam cada refeição em um momento único.
        </motion.p>
        <motion.div variants={item} className="hero__cta">
          <Link to="/cardapio" className="btn btn--gold btn--lg">CONHEÇA NOSSO CARDÁPIO</Link>
          <Link to="/cardapio" className="btn btn--outline-light btn--lg">FAÇA SEU PEDIDO</Link>
        </motion.div>
        <motion.ul variants={item} className="hero__features">
          {DESTAQUES.map(({ icon: Icon, label }) => (
            <li key={label}><Icon size={20} aria-hidden="true" /> {label}</li>
          ))}
        </motion.ul>
      </motion.div>
      <a href="#sobre" className="hero__scroll" aria-label="Rolar para a próxima seção"><ArrowDown size={20} /></a>
    </section>
  );
}
