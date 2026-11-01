import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    telefone: { type: String, trim: true, default: '' },
    assunto: { type: String, trim: true, maxlength: 120, default: '' },
    mensagem: { type: String, required: true, trim: true, maxlength: 2000 },
    lida: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
