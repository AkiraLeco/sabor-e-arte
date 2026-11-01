import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middlewares/auth.js';
import { AppError, asyncHandler } from '../middlewares/error.js';

// Hash fictício para manter o tempo de resposta parecido quando o e-mail não existe
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5W1rJ5oI5d1v8cK9R3m4q8x0m0yq2dO';

export const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  const user = await User.findOne({ email }).select('+senha');
  const ok = user ? await user.conferirSenha(senha) : (await bcrypt.compare(senha, DUMMY_HASH), false);
  if (!user || !ok) throw new AppError('E-mail ou senha incorretos.', 401);

  res.json({ token: signToken(user), usuario: { id: user._id, nome: user.nome, email: user.email, papel: user.papel } });
});

export const alterarSenha = asyncHandler(async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  const user = await User.findById(req.user._id).select('+senha');
  if (!(await user.conferirSenha(senhaAtual))) throw new AppError('A senha atual está incorreta.', 400);
  if (senhaAtual === novaSenha) throw new AppError('A nova senha deve ser diferente da atual.', 400);
  user.senha = novaSenha; // o hash é feito no hook pre('save')
  await user.save();
  res.json({ ok: true });
});

export const me = (req, res) => {
  const u = req.user;
  res.json({ usuario: { id: u._id, nome: u.nome, email: u.email, papel: u.papel } });
};
