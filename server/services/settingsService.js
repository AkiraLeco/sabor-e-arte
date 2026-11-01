import Settings from '../models/Settings.js';
import { env } from '../config/env.js';

export async function getSettings() {
  let s = await Settings.findOne({ chave: 'principal' });
  if (!s) s = await Settings.create({ chave: 'principal', whatsapp: env.whatsapp });
  return s;
}

// Versão pública: WhatsApp cai para a variável de ambiente se não definido no painel
export function toPublic(settings) {
  const obj = settings.toObject ? settings.toObject() : settings;
  delete obj.__v;
  obj.whatsapp = (obj.whatsapp || env.whatsapp || '').replace(/\D/g, '');
  return obj;
}
