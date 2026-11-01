import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Modal, SmartImage, QtyStepper, EmptyState } from './ui';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { brl, calcFee } from '../services/format';

export default function CartDrawer() {
  const { items, subtotal, count, unit, open, setOpen, changeQty, remove, setNote } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const fee = calcFee(settings, 'entrega', '', subtotal);
  const min = settings?.pedidoMinimo || 0;
  const abaixoMinimo = min > 0 && subtotal < min;

  const goCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <Modal open={open} onClose={close} side label="Carrinho de pedidos" className="cart">
      <header className="cart__head">
        <h2>Seu pedido</h2>
        {count > 0 && <span>{count} {count === 1 ? 'item' : 'itens'}</span>}
      </header>

      {items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Seu carrinho está vazio" text="Escolha seus pratos favoritos no cardápio.">
          <button className="btn btn--primary" onClick={() => { close(); navigate('/cardapio'); }}>VER CARDÁPIO</button>
        </EmptyState>
      ) : (
        <>
          <ul className="cart__list">
            <AnimatePresence initial={false}>
              {items.map((i) => (
                <motion.li key={i.key} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0 }} className="cart-item">
                  <SmartImage src={i.produto.imagem} alt="" className="cart-item__img" />
                  <div className="cart-item__info">
                    <strong>{i.produto.nome}</strong>
                    {i.adicionais.length > 0 && <small>+ {i.adicionais.map((a) => a.nome).join(', ')}</small>}
                    {i.removidos.length > 0 && <small>Sem {i.removidos.join(', ').toLowerCase()}</small>}
                    <input
                      className="cart-item__note"
                      value={i.observacao}
                      onChange={(e) => setNote(i.key, e.target.value)}
                      placeholder="Adicionar observação"
                      aria-label={`Observação para ${i.produto.nome}`}
                      maxLength={200}
                    />
                    <div className="cart-item__row">
                      <QtyStepper value={i.quantidade} min={0} onChange={(v) => changeQty(i.key, v - i.quantidade)} label={`Quantidade de ${i.produto.nome}`} />
                      <span className="cart-item__price">{brl(unit(i) * i.quantidade)}</span>
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => remove(i.key)} aria-label={`Remover ${i.produto.nome}`}><Trash2 size={18} /></button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <footer className="cart__foot">
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
              <div>
                <dt>Taxa de entrega <small>(retirada: grátis)</small></dt>
                <dd>{fee === 0 ? 'Grátis' : brl(fee)}</dd>
              </div>
              <div className="totals__total"><dt>Total estimado</dt><dd>{brl(subtotal + fee)}</dd></div>
            </dl>
            <small className="cart__hint">A taxa final depende do bairro e é calculada no checkout.</small>
            {abaixoMinimo && <p className="alert alert--warn">Pedido mínimo: {brl(min)}. Faltam {brl(min - subtotal)}.</p>}
            <button className="btn btn--primary btn--lg btn--block" onClick={goCheckout} disabled={abaixoMinimo}>FINALIZAR PEDIDO</button>
            <button className="btn btn--ghost btn--block" onClick={close}>Continuar escolhendo</button>
          </footer>
        </>
      )}
    </Modal>
  );
}
