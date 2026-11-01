import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 60 },
    nota: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, required: true, trim: true, maxlength: 500 },
    aprovada: { type: Boolean, default: false }, // só aparece no site após moderação
    demo: { type: Boolean, default: false }, // exemplo demonstrativo (não é avaliação real)
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
