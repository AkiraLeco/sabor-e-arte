import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react';

const CartContext = createContext(null);
const KEY = 'restaurante_carrinho_v1';

const loadInitial = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

// Chave que identifica uma "linha" do carrinho: mesmo prato com mesmas opções soma quantidade
const lineKey = (i) =>
  [i.produto._id, [...i.adicionais.map((a) => a._id)].sort().join(','), [...i.removidos].sort().join(','), i.observacao.trim().toLowerCase()].join('|');

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const item = { ...action.item, observacao: action.item.observacao || '' };
      const key = lineKey(item);
      const existing = state.find((i) => i.key === key);
      if (existing) {
        return state.map((i) => (i.key === key ? { ...i, quantidade: Math.min(i.quantidade + item.quantidade, 50) } : i));
      }
      return [...state, { ...item, key }];
    }
    case 'qty':
      return state
        .map((i) => (i.key === action.key ? { ...i, quantidade: Math.min(Math.max(i.quantidade + action.delta, 0), 50) } : i))
        .filter((i) => i.quantidade > 0);
    case 'remove':
      return state.filter((i) => i.key !== action.key);
    case 'note':
      return state.map((i) => (i.key === action.key ? { ...i, observacao: action.value.slice(0, 200) } : i));
    case 'sync': // atualiza preço/disponibilidade com os dados mais recentes do servidor
      return state
        .map((i) => ({ ...i, produto: action.fresh.get(i.produto._id) || null }))
        .filter((i) => i.produto)
        .map((i) => ({
          ...i,
          adicionais: i.adicionais
            .map((a) => i.produto.adicionais.find((x) => x._id === a._id))
            .filter(Boolean)
            .map(({ _id, nome, preco }) => ({ _id, nome, preco })),
        }));
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadInitial);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage cheio ou bloqueado */ }
  }, [items]);

  const add = useCallback((item) => dispatch({ type: 'add', item }), []);
  const changeQty = useCallback((key, delta) => dispatch({ type: 'qty', key, delta }), []);
  const remove = useCallback((key) => dispatch({ type: 'remove', key }), []);
  const setNote = useCallback((key, value) => dispatch({ type: 'note', key, value }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const sync = useCallback((list) => dispatch({ type: 'sync', fresh: new Map(list.map((p) => [p._id, p])) }), []);

  const value = useMemo(() => {
    const unit = (i) => (i.produto.precoFinal ?? i.produto.preco) + i.adicionais.reduce((s, a) => s + a.preco, 0);
    const subtotal = Math.round(items.reduce((s, i) => s + unit(i) * i.quantidade, 0) * 100) / 100;
    const count = items.reduce((s, i) => s + i.quantidade, 0);
    return { items, subtotal, count, unit, add, changeQty, remove, setNote, clear, sync, open, setOpen };
  }, [items, open, add, changeQty, remove, setNote, clear, sync]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
