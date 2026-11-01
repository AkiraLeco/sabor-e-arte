import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Modal, SmartImage, QtyStepper } from './ui';
import { Price } from './ProductCard';
import { brl } from '../services/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductModal({ produto, onClose }) {
  const { add } = useCart();
  const toast = useToast();
  const [adicionais, setAdicionais] = useState([]);
  const [removidos, setRemovidos] = useState([]);
  const [observacao, setObservacao] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  useEffect(() => {
    setAdicionais([]); setRemovidos([]); setObservacao(''); setQuantidade(1);
  }, [produto?._id]);

  const selecionados = useMemo(
    () => (produto ? produto.adicionais.filter((a) => adicionais.includes(a._id)) : []),
    [produto, adicionais]
  );
  const unit = produto ? produto.precoFinal + selecionados.reduce((s, a) => s + a.preco, 0) : 0;
  const total = unit * quantidade;

  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = () => {
    add({
      produto,
      quantidade,
      adicionais: selecionados.map(({ _id, nome, preco }) => ({ _id, nome, preco })),
      removidos,
      observacao: observacao.trim(),
    });
    toast.success(`${quantidade}x ${produto.nome} adicionado ao pedido`);
    onClose();
  };

  return (
    <Modal open={Boolean(produto)} onClose={onClose} label={produto ? `Detalhes de ${produto.nome}` : 'Detalhes'} className="product-modal">
      {produto && (
        <>
          <div className="product-modal__media">
            <SmartImage src={produto.imagem} alt={produto.nome} eager />
          </div>
          <div className="product-modal__content">
            <span className="product-card__cat">{produto.categoria?.nome}</span>
            <h2>{produto.nome}</h2>
            <p className="product-modal__desc">{produto.descricaoCompleta || produto.descricao}</p>
            <Price produto={produto} size="price--lg" />

            {produto.adicionais.length > 0 && (
              <fieldset className="options">
                <legend>Adicionais</legend>
                {produto.adicionais.map((a) => (
                  <label key={a._id} className="check">
                    <input type="checkbox" checked={adicionais.includes(a._id)} onChange={() => toggle(adicionais, setAdicionais, a._id)} />
                    <span>{a.nome}</span>
                    <em>{a.preco > 0 ? `+ ${brl(a.preco)}` : 'Grátis'}</em>
                  </label>
                ))}
              </fieldset>
            )}

            {produto.ingredientes.length > 0 && (
              <fieldset className="options">
                <legend>Remover ingredientes</legend>
                {produto.ingredientes.map((ing) => (
                  <label key={ing} className="check">
                    <input type="checkbox" checked={removidos.includes(ing)} onChange={() => toggle(removidos, setRemovidos, ing)} />
                    <span>Sem {ing.toLowerCase()}</span>
                  </label>
                ))}
              </fieldset>
            )}

            <div className="field">
              <label htmlFor="obs-prod">Observações especiais</label>
              <textarea id="obs-prod" rows={2} maxLength={200} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: ponto da carne, alergias..." />
            </div>

            <div className="product-modal__footer">
              <QtyStepper value={quantidade} onChange={setQuantidade} />
              <button className="btn btn--primary btn--lg" onClick={submit} disabled={!produto.disponivel}>
                <ShoppingBag size={18} />
                {produto.disponivel ? <>ADICIONAR <span>{brl(total)}</span></> : 'INDISPONÍVEL'}
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
