import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AppError } from './error.js';

fs.mkdirSync(env.uploadsDir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: env.uploadsDir,
  // nome aleatório: ignora o nome original enviado pelo cliente
  filename: (_req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + EXT[file.mimetype]),
});

export const uploadImagem = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!EXT[file.mimetype] || !['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new AppError('Envie uma imagem JPG, PNG, WEBP ou GIF.', 400));
    }
    cb(null, true);
  },
}).single('imagem');
