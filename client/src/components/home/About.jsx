import { Sprout, Flame, Bike, HeartHandshake } from 'lucide-react';
import { Reveal, SmartImage } from '../ui';

const DIFERENCIAIS = [
  { icon: Sprout, title: 'Ingredientes frescos', text: 'Compramos de fornecedores selecionados e priorizamos produtos da estação.' },
  { icon: Flame, title: 'Preparo artesanal', text: 'Molhos, massas e temperos feitos na casa, todos os dias.' },
  { icon: Bike, title: 'Entrega cuidadosa', text: 'Embalagens pensadas para o prato chegar quente e com a mesma aparência.' },
  { icon: HeartHandshake, title: 'Atendimento próximo', text: 'Acompanhe seu pedido em tempo real e fale conosco quando precisar.' },
];

export default function About() {
  return (
    <section id="sobre" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <Reveal className="about__text">
          <span className="eyebrow">Sobre nós</span>
          <h2 id="about-title">MAIS QUE UMA REFEIÇÃO, UMA EXPERIÊNCIA.</h2>
          <p>
            Nascemos da vontade de servir comida de verdade: preparada com calma, com ingredientes que a gente
            conhece e com o cuidado de quem cozinha para a própria família.
          </p>
          <p>
            Nossa filosofia é simples: respeitar o ingrediente, valorizar o sabor brasileiro e entregar consistência
            em cada prato, seja no salão, na retirada ou na porta da sua casa. Da seleção dos produtos ao empratamento,
            cada etapa é feita com atenção.
          </p>
          <p>
            Nosso compromisso é com você: transparência no cardápio, preço justo e um atendimento que faz
            você querer voltar.
          </p>
        </Reveal>

        <Reveal className="about__photos" delay={0.15}>
          <SmartImage className="about__photo about__photo--a" src="/images/1577219491135-ce391730fb2c.jpg" alt="Chef finalizando um prato na cozinha do restaurante" />
          <SmartImage className="about__photo about__photo--b" src="/images/1555396273-367ea4eb4db5.jpg" alt="Salão do restaurante" />
          <div className="about__seal"><strong>100%</strong><span>feito na casa</span></div>
        </Reveal>
      </div>

      <div className="container">
        <ul className="diffs">
          {DIFERENCIAIS.map(({ icon: Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 0.08} className="diff">
              <span className="diff__icon"><Icon size={24} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
