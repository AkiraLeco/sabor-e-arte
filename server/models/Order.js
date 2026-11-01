import mongoose from 'mongoose';

export const STATUS = [
  'aguardando_confirmacao',
  'confirmado',
  'em_preparacao',
  'pronto_retirada',
  'saiu_entrega',
  'concluido',
  'cancelado',
];

const itemSchema = new mongoose.Schema(
  {
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nome: String,
    precoBase: Number,
    quantidade: Number,
    adicionais: [{ nome: String, preco: Number, _id: false }],
    removidos: [String],
    observacao: { type: String, default: '' },
    precoUnitario: Number, // preço base + adicionais
    subtotal: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, index: true },
    cliente: {
      nome: { type: String, required: true },
      telefone: { type: String, required: true },
    },
    tipo: { type: String, enum: ['entrega', 'retirada', 'local'], required: true },
    endereco: { rua: String, numero: String, complemento: String, bairro: String },
    itens: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: Number,
    taxaEntrega: { type: Number, default: 0 },
    total: Number,
    pagamento: {
      forma: { type: String, enum: ['pix', 'dinheiro', 'credito', 'debito'], required: true },
      troco: { type: Number, default: null }, // valor que o cliente entregará (dinheiro)
    },
    observacoes: { type: String, default: '' },
    status: { type: String, enum: STATUS, default: 'aguardando_confirmacao', index: true },
    historico: [{ status: String, em: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
