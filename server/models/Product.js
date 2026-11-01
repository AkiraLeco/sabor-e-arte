import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 60 },
    preco: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 100 },
    descricao: { type: String, trim: true, maxlength: 400, default: '' },
    descricaoCompleta: { type: String, trim: true, maxlength: 1500, default: '' },
    preco: { type: Number, required: true, min: 0 },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    imagem: { type: String, trim: true, default: '' },
    disponivel: { type: Boolean, default: true },
    emPromocao: { type: Boolean, default: false },
    precoPromocional: { type: Number, min: 0, default: null },
    promocaoAte: { type: Date, default: null },
    etiqueta: { type: String, trim: true, maxlength: 30, default: '' },
    ingredientes: { type: [String], default: [] }, // podem ser removidos pelo cliente
    adicionais: { type: [addonSchema], default: [] },
    vendas: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ nome: 'text', descricao: 'text' });

// Promoção vigente: ativa, com preço menor e dentro da validade
productSchema.virtual('promocaoVigente').get(function () {
  return Boolean(
    this.emPromocao && this.precoPromocional != null && this.precoPromocional < this.preco &&
      (!this.promocaoAte || this.promocaoAte > new Date())
  );
});

productSchema.methods.precoAtual = function () {
  return this.promocaoVigente ? this.precoPromocional : this.preco;
};

productSchema.virtual('precoFinal').get(function () {
  return this.precoAtual();
});

export default mongoose.model('Product', productSchema);
