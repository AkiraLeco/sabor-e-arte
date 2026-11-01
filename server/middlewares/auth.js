import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from './error.js';

// Exige token JWT válido e usuário existente com papel de administrador
export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Autenticação necessária.', 401);

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new AppError('Sessão inválida ou expirada. Faça login novamente.', 401);
    }

    const user = await User.findById(payload.id);
    if (!user) throw new AppError('Usuário não encontrado.', 401);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.papel !== 'admin') return next(new AppError('Acesso restrito ao administrador.', 403));
  next();
}

export function signToken(user) {
  return jwt.sign({ id: user._id, papel: user.papel }, env.jwtSecret, { expiresIn: env.jwtExpires });
}

// Identifica o admin quando há token, mas não bloqueia visitantes
export async function optionalAuth(req, _res, next) {
  if (!req.headers.authorization) return next();
  return protect(req, _res, (err) => next(err && err.status === 401 ? undefined : err));
}
