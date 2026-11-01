const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'admin_token';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage indisponível */ }
};

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith('/auth/login')) window.dispatchEvent(new Event('auth:expired'));
    throw new ApiError(data.erro || 'Ocorreu um erro inesperado.', res.status, data.detalhes);
  }
  return data;
}

const qs = (params = {}) => {
  const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  // público
  configuracoes: () => request('/configuracoes'),
  categorias: (params) => request(`/categorias${qs(params)}`),
  produtos: (params) => request(`/produtos${qs(params)}`),
  criarPedido: (body) => request('/pedidos', { method: 'POST', body }),
  acompanharPedido: (numero, telefone) => request(`/pedidos/acompanhar/${encodeURIComponent(numero)}${qs({ telefone })}`),
  enviarContato: (body) => request('/contato', { method: 'POST', body }),
  avaliacoes: () => request('/avaliacoes'),
  enviarAvaliacao: (body) => request('/avaliacoes', { method: 'POST', body }),

  // admin
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  alterarSenha: (body) => request('/auth/senha', { method: 'PUT', body }),
  dashboard: () => request('/admin/dashboard'),
  pedidos: (params) => request(`/pedidos${qs(params)}`),
  atualizarStatus: (id, status) => request(`/pedidos/${id}/status`, { method: 'PUT', body: { status } }),
  salvarProduto: (id, body) => request(id ? `/produtos/${id}` : '/produtos', { method: id ? 'PUT' : 'POST', body }),
  alternarDisponibilidade: (id) => request(`/produtos/${id}/disponibilidade`, { method: 'PATCH' }),
  excluirProduto: (id) => request(`/produtos/${id}`, { method: 'DELETE' }),
  salvarCategoria: (id, body) => request(id ? `/categorias/${id}` : '/categorias', { method: id ? 'PUT' : 'POST', body }),
  excluirCategoria: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
  reordenarCategorias: (ids) => request('/categorias/reordenar', { method: 'PUT', body: { ids } }),
  salvarConfiguracoes: (body) => request('/configuracoes', { method: 'PUT', body }),
  mensagens: () => request('/admin/mensagens'),
  marcarMensagem: (id, lida) => request(`/admin/mensagens/${id}`, { method: 'PUT', body: { lida } }),
  excluirMensagem: (id) => request(`/admin/mensagens/${id}`, { method: 'DELETE' }),
  avaliacoesAdmin: () => request('/admin/avaliacoes'),
  moderarAvaliacao: (id, aprovada) => request(`/admin/avaliacoes/${id}`, { method: 'PUT', body: { aprovada } }),
  excluirAvaliacao: (id) => request(`/admin/avaliacoes/${id}`, { method: 'DELETE' }),
  upload: (file) => {
    const form = new FormData();
    form.append('imagem', file);
    return request('/admin/upload', { method: 'POST', form });
  },
};
