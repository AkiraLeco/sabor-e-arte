import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(message, status = 400, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, _res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Erro interno do servidor.';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Dados inválidos.';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Identificador inválido.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Já existe um registro com esses dados.';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'A imagem deve ter no máximo 3 MB.' : 'Falha no envio do arquivo.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Requisição grande demais.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON inválido.';
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProd) message = 'Erro interno do servidor.';
  }

  res.status(status).json({ erro: message, detalhes: details });
}
