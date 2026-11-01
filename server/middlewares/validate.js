import mongoose from 'mongoose';
import { AppError } from './error.js';

// Valida e substitui req[source] pelo resultado do schema zod (já saneado)
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const detalhes = result.error.issues.map((i) => `${i.path.join('.') || 'campo'}: ${i.message}`);
    return next(new AppError('Dados inválidos.', 400, detalhes));
  }
  req[source] = result.data;
  next();
};

export const validateObjectId = (param = 'id') => (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) return next(new AppError('Identificador inválido.', 400));
  next();
};
