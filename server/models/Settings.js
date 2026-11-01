import mongoose from 'mongoose';

const horarioSchema = new mongoose.Schema(
  { dia: String, abre: String, fecha: String, fechado: { type: Boolean, default: false } },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    chave: { type: String, default: 'principal', unique: true },
    nome: { type: String, default: 'Sabor & Arte' },
    slogan: { type: String, default: 'Cozinha brasileira autoral' },
    logo: { type: String, default: '' },
    descricao: {
      type: String,
      default: 'Restaurante de cozinha brasileira contemporânea, com ingredientes selecionados e preparo artesanal.',
    },
    endereco: { type: String, default: 'Rua das Palmeiras, 123 - Centro' },
    cidade: { type: String, default: 'São Paulo - SP' },
    telefone: { type: String, default: '(00) 0000-0000' },
    whatsapp: { type: String, default: '' }, // somente dígitos com DDI, ex.: 5511999999999
    instagram: { type: String, default: '' },
    email: { type: String, default: '' },
    mapaUrl: { type: String, default: '' }, // URL de embed do Google Maps
    horarios: {
      type: [horarioSchema],
      default: [
        { dia: 'Segunda a Sexta', abre: '11:00', fecha: '22:00' },
        { dia: 'Sábado', abre: '11:00', fecha: '23:00' },
        { dia: 'Domingo', abre: '11:00', fecha: '17:00' },
      ],
    },
    taxaEntregaPadrao: { type: Number, default: 8, min: 0 },
    taxasPorBairro: { type: [{ bairro: String, taxa: { type: Number, min: 0 }, _id: false }], default: [] },
    entregaGratisAcimaDe: { type: Number, default: 0, min: 0 }, // 0 = desativado
    pedidoMinimo: { type: Number, default: 0, min: 0 },
    pagamentos: {
      pix: { type: Boolean, default: true },
      dinheiro: { type: Boolean, default: true },
      credito: { type: Boolean, default: true },
      debito: { type: Boolean, default: true },
    },
    tiposPedido: {
      entrega: { type: Boolean, default: true },
      retirada: { type: Boolean, default: true },
      local: { type: Boolean, default: true },
    },
    pratoDoDia: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    chavePix: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
