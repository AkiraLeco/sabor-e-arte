import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 60, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    descricao: { type: String, trim: true, maxlength: 200, default: '' },
    ordem: { type: Number, default: 0 },
    ativa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
