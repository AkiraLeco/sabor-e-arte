import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Flame } from 'lucide-react';
import { SmartImage } from './ui';
import { brl } from '../services/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function Price({ produto, size = '' }) {
  return (
    <span className={`price ${size}`}>
      {produto.promocaoVigente && <s className="price__old">{brl(produto.preco)}</s>}
      <strong className={produto.promocaoVigente ? 'price__promo' : ''}>{brl(produto.precoFinal)}</strong>
    </span>
  );
}

export default function ProductCard({ produto, onOpen, index = 0 }) {
  const { add } = useCart();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const temOpcoes = produto.adicionais.length > 0 || produto.ingredientes.length > 0;

  const quickAdd = (e) => {
    e.stopPropagation();
    if (!produto.disponivel) return;
    // Pratos com opções abrem o modal para o cliente escolher; os demais entram direto
    if (temOpcoes) return onOpen(produto);
    add({ produto, quantidade: 1, adicionais: [], removidos: [], observacao: '' });
    toast.success(`${produto.nome} adicionado ao pedido`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.article
      className={`product-card${produto.disponivel ? '' : ' is-unavailable'}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index % 3, 2) * 0.07 }}
      whileHover={{ y: -4 }}
    >
      <button className="product-card__media" onClick={() => onOpen(produto)} aria-label={`Ver detalhes de ${produto.nome}`}>
        <SmartImage src={produto.imagem} alt={produto.nome} />
        <span className="product-card__tags">
          {produto.promocaoVigente && <span className="tag tag--promo"><Flame size={12} /> {produto.etiqueta || 'Promoção'}</span>}
          {!produto.promocaoVigente && produto.etiqueta && <span className="tag tag--gold">{produto.etiqueta}</span>}
        </span>
        <span className={`tag tag--stock ${produto.disponivel ? 'is-on' : 'is-off'}`}>
          {produto.disponivel ? 'Disponível' : 'Indisponível'}
        </span>
      </button>
      <div className="product-card__body">
        <span className="product-card__cat">{produto.categoria?.nome}</span>
        <h3><button onClick={() => onOpen(produto)}>{produto.nome}</button></h3>
        <p>{produto.descricao}</p>
        <div className="product-card__footer">
          <Price produto={produto} />
          <button className={`btn btn--sm ${added ? 'btn--ok' : 'btn--primary'}`} onClick={quickAdd} disabled={!produto.disponivel}>
            {added ? <><Check size={16} /> ADICIONADO</> : <><Plus size={16} /> {produto.disponivel ? 'ADICIONAR AO PEDIDO' : 'INDISPONÍVEL'}</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
