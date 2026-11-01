import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Clock, TrendingUp } from 'lucide-react';
import { Reveal, SectionTitle, SmartImage, ProductSkeletons } from '../ui';
import ProductCard, { Price } from '../ProductCard';
import ProductModal from '../ProductModal';
import { useSettings } from '../../context/SettingsContext';
import { brl, formatDate } from '../../services/format';

export default function Promotions({ produtos, loading, error }) {
  const { settings } = useSettings();
  const [selecionado, setSelecionado] = useState(null);

  const { promos, maisVendidos } = useMemo(() => {
    const list = produtos || [];
    return {
      promos: list.filter((p) => p.promocaoVigente && p.disponivel),
      maisVendidos: [...list].filter((p) => p.vendas > 0 && p.disponivel).sort((a, b) => b.vendas - a.vendas).slice(0, 4),
    };
  }, [produtos]);

  const prato = settings?.pratoDoDiaProduto;
  const pratoDoDia = prato && produtos?.find((p) => p._id === prato._id);
  const comDesconto = pratoDoDia?.promocaoVigente
    ? Math.round((1 - pratoDoDia.precoFinal / pratoDoDia.preco) * 100)
    : 0;

  return (
    <section id="promocoes" className="section section--dark promos" aria-labelledby="promo-title">
      <div className="container">
        <SectionTitle
          light
          eyebrow="Promoções e destaques"
          title="Ofertas que valem a mesa"
          subtitle="Combos especiais, descontos e os pratos que mais saem da nossa cozinha."
        />
        <h2 id="promo-title" className="sr-only">Promoções</h2>

        {loading && <ProductSkeletons n={3} />}
        {error && <p className="alert alert--error">Não foi possível carregar as promoções agora.</p>}

        {pratoDoDia && (
          <Reveal className="dish-of-day">
            <SmartImage src={pratoDoDia.imagem} alt={pratoDoDia.nome} className="dish-of-day__img" />
            <div className="dish-of-day__body">
              <span className="eyebrow eyebrow--gold"><Crown size={14} /> Prato do dia</span>
              <h3>{pratoDoDia.nome}</h3>
              <p>{pratoDoDia.descricaoCompleta || pratoDoDia.descricao}</p>
              <div className="dish-of-day__price">
                <Price produto={pratoDoDia} size="price--lg price--light" />
                {comDesconto > 0 && <span className="tag tag--promo">-{comDesconto}%</span>}
              </div>
              <button className="btn btn--gold btn--lg" onClick={() => setSelecionado(pratoDoDia)} disabled={!pratoDoDia.disponivel}>
                PEDIR AGORA
              </button>
            </div>
          </Reveal>
        )}

        {promos.length > 0 && (
          <>
            <h3 className="subhead"><Clock size={18} /> Combos e descontos</h3>
            <div className="promo-grid">
              {promos.map((p, i) => (
                <Reveal key={p._id} delay={i * 0.06} className="promo-card">
                  <button className="promo-card__media" onClick={() => setSelecionado(p)} aria-label={`Ver ${p.nome}`}>
                    <SmartImage src={p.imagem} alt={p.nome} />
                    <span className="tag tag--promo">{p.etiqueta || 'Promoção'}</span>
                  </button>
                  <div className="promo-card__body">
                    <h4>{p.nome}</h4>
                    <p>{p.descricao}</p>
                    {p.promocaoAte && <small className="promo-card__until">Válido até {formatDate(p.promocaoAte)}</small>}
                    <div className="promo-card__foot">
                      <span className="price price--light"><s className="price__old">{brl(p.preco)}</s><strong className="price__promo">{brl(p.precoFinal)}</strong></span>
                      <button className="btn btn--gold btn--sm" onClick={() => setSelecionado(p)}>APROVEITAR</button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>

      {maisVendidos.length > 0 && (
        <div className="container best">
          <h3 className="subhead"><TrendingUp size={18} /> Mais vendidos</h3>
          <div className="product-grid product-grid--light">
            {maisVendidos.map((p, i) => <ProductCard key={p._id} produto={p} index={i} onOpen={setSelecionado} />)}
          </div>
          <div className="center"><Link to="/cardapio" className="btn btn--outline-light">VER CARDÁPIO COMPLETO</Link></div>
        </div>
      )}

      <ProductModal produto={selecionado} onClose={() => setSelecionado(null)} />
    </section>
  );
}
