import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senha: { type: String, required: true, select: false },
    papel: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 12);
  next();
});

userSchema.methods.conferirSenha = function (plain) {
  return bcrypt.compare(plain, this.senha);
};

export default mongoose.model('User', userSchema);
