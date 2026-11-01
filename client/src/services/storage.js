const KEY = 'restaurante_meus_pedidos_v1';

// Guarda os últimos pedidos feitos neste aparelho, para reabrir o acompanhamento
export function loadOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveOrder({ numero, telefone }) {
  try {
    const list = loadOrders().filter((o) => o.numero !== numero);
    localStorage.setItem(KEY, JSON.stringify([{ numero, telefone, em: Date.now() }, ...list].slice(0, 5)));
  } catch { /* ignorar */ }
}

export const findOrder = (numero) => loadOrders().find((o) => o.numero === numero);

const DRAFT = 'restaurante_checkout_v1';
export function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT)) || {}; } catch { return {}; }
}
export function saveDraft(d) {
  try { localStorage.setItem(DRAFT, JSON.stringify(d)); } catch { /* ignorar */ }
}
