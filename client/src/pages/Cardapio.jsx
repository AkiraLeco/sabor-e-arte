import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Flame, TrendingUp, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { EmptyState, ProductSkeletons } from '../components/ui';
import { brl } from '../services/format';

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Cardapio() {
  const { settings } = useSettings();
  useSeo({
    title: `Cardápio digital | ${settings?.nome || 'Restaurante'}`,
    description: 'Veja pratos, massas, carnes, hambúrgueres, sobremesas e bebidas. Monte seu pedido online.',
  });

  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') || 'todos';
  const [busca, setBusca] = useState(params.get('q') || '');
  const [filtro, setFiltro] = useState('todos'); // todos | promocao | vendidos
  const [ordem, setOrdem] = useState('padrao'); // padrao | menor | maior
  const [selecionado, setSelecionado] = useState(null);
  const { count, subtotal, setOpen } = useCart();

  const prods = useFetch(() => api.produtos());
  const cats = useFetch(() => api.categorias());

  const setCategoria = (slug) => {
    const next = new URLSearchParams(params);
    slug === 'todos' ? next.delete('categoria') : next.set('categoria', slug);
    setParams(next, { replace: true });
  };

  const filtrados = useMemo(() => {
    let list = prods.data || [];
    if (categoria !== 'todos') list = list.filter((p) => p.categoria?.slug === categoria);
    if (busca.trim()) {
      const t = norm(busca.trim());
      list = list.filter((p) => norm(`${p.nome} ${p.descricao} ${p.categoria?.nome}`).includes(t));
    }
    if (filtro === 'promocao') list = list.filter((p) => p.promocaoVigente);
    if (filtro === 'vendidos') list = list.filter((p) => p.vendas > 0).sort((a, b) => b.vendas - a.vendas).slice(0, 12);
    else if (ordem === 'menor') list = [...list].sort((a, b) => a.precoFinal - b.precoFinal);
    else if (ordem === 'maior') list = [...list].sort((a, b) => b.precoFinal - a.precoFinal);
    return list;
  }, [prods.data, categoria, busca, filtro, ordem]);

  // Sem filtros: agrupa por categoria, na ordem definida no painel
  const agrupar = categoria === 'todos' && !busca.trim() && filtro === 'todos' && ordem === 'padrao';
  const grupos = useMemo(() => {
    if (!agrupar) return [];
    return (cats.data || [])
      .map((c) => ({ cat: c, itens: filtrados.filter((p) => p.categoria?.slug === c.slug) }))
      .filter((g) => g.itens.length);
  }, [agrupar, cats.data, filtrados]);

  const limpar = () => { setBusca(''); setFiltro('todos'); setOrdem('padrao'); setCategoria('todos'); };
  const temFiltro = busca || filtro !== 'todos' || ordem !== 'padrao' || categoria !== 'todos';

  return (
    <main id="conteudo" className="page menu-page">
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow--gold">Cardápio digital</span>
          <h1>Escolha seus pratos</h1>
          <p>Toque em um prato para ver detalhes, escolher adicionais e montar do seu jeito.</p>
        </div>
      </div>

      <div className="container menu-filters">
          <div className="menu-toolbar__row">
            <div className="search">
              <Search size={18} aria-hidden="true" />
              <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar prato, ingrediente ou categoria" aria-label="Buscar no cardápio" />
              {busca && <button onClick={() => setBusca('')} aria-label="Limpar busca"><X size={16} /></button>}
            </div>
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar por" disabled={filtro === 'vendidos'}>
              <option value="padrao">Ordem do cardápio</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>
          <div className="chips chips--scroll chips--sub">
            <button className={`chip chip--promo${filtro === 'promocao' ? ' is-active' : ''}`} aria-pressed={filtro === 'promocao'} onClick={() => setFiltro(filtro === 'promocao' ? 'todos' : 'promocao')}><Flame size={14} /> Em promoção</button>
            <button className={`chip chip--promo${filtro === 'vendidos' ? ' is-active' : ''}`} aria-pressed={filtro === 'vendidos'} onClick={() => setFiltro(filtro === 'vendidos' ? 'todos' : 'vendidos')}><TrendingUp size={14} /> Mais vendidos</button>
            {temFiltro && <button className="chip chip--clear" onClick={limpar}><X size={14} /> Limpar filtros</button>}
          </div>
      </div>

      <div className="menu-toolbar">
        <div className="container">
          <div className="chips chips--scroll" role="tablist" aria-label="Categorias">
            <button role="tab" aria-selected={categoria === 'todos'} className={`chip${categoria === 'todos' ? ' is-active' : ''}`} onClick={() => setCategoria('todos')}>Todos</button>
            {(cats.data || []).map((c) => (
              <button key={c._id} role="tab" aria-selected={categoria === c.slug} className={`chip${categoria === c.slug ? ' is-active' : ''}`} onClick={() => setCategoria(c.slug)}>{c.nome}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container menu-content">
        {prods.loading && <ProductSkeletons n={6} />}
        {prods.error && (
          <EmptyState icon={UtensilsCrossed} title="Não foi possível carregar o cardápio" text={prods.error}>
            <button className="btn btn--primary" onClick={prods.reload}>TENTAR NOVAMENTE</button>
          </EmptyState>
        )}

        {!prods.loading && !prods.error && filtrados.length === 0 && (
          <EmptyState icon={Search} title="Nenhum prato encontrado" text="Tente outra busca ou remova os filtros.">
            <button className="btn btn--primary" onClick={limpar}>LIMPAR FILTROS</button>
          </EmptyState>
        )}

        {!prods.loading && agrupar && grupos.map((g) => (
          <section key={g.cat._id} className="menu-group" aria-labelledby={`g-${g.cat.slug}`}>
            <header>
              <h2 id={`g-${g.cat.slug}`}>{g.cat.nome}</h2>
              {g.cat.descricao && <p>{g.cat.descricao}</p>}
            </header>
            <div className="product-grid">
              {g.itens.map((p, i) => <ProductCard key={p._id} produto={p} index={i} onOpen={setSelecionado} />)}
            </div>
          </section>
        ))}

        {!prods.loading && !agrupar && filtrados.length > 0 && (
          <>
            <p className="results-count" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'prato encontrado' : 'pratos encontrados'}</p>
            <div className="product-grid">
              {filtrados.map((p, i) => <ProductCard key={p._id} produto={p} index={i} onOpen={setSelecionado} />)}
            </div>
          </>
        )}
      </div>

      {count > 0 && (
        <button className="cart-bar" onClick={() => setOpen(true)}>
          <span><ShoppingBag size={18} /> Ver pedido ({count})</span>
          <strong>{brl(subtotal)}</strong>
        </button>
      )}

      <ProductModal produto={selecionado} onClose={() => setSelecionado(null)} />
    </main>
  );
}
