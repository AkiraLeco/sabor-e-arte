import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, requireAdmin, optionalAuth } from '../middlewares/auth.js';
import { validate, validateObjectId } from '../middlewares/validate.js';
import { uploadImagem } from '../middlewares/upload.js';
import * as S from '../middlewares/schemas.js';
import * as auth from '../controllers/authController.js';
import * as cat from '../controllers/categoryController.js';
import * as prod from '../controllers/productController.js';
import * as ped from '../controllers/orderController.js';
import * as admin from '../controllers/adminController.js';
import * as pub from '../controllers/publicController.js';

const router = Router();
const adminOnly = [protect, requireAdmin];
const id = validateObjectId('id');

const limitar = (max, minutos, msg) =>
  rateLimit({ windowMs: minutos * 60 * 1000, max, standardHeaders: true, legacyHeaders: false, message: { erro: msg } });
const limiteLogin = limitar(10, 15, 'Muitas tentativas de login. Aguarde 15 minutos.');
const limiteEnvio = limitar(15, 15, 'Muitas requisições. Tente novamente em alguns minutos.');

router.get('/health', (_req, res) => res.json({ ok: true }));

// Autenticação
router.post('/auth/login', limiteLogin, validate(S.loginSchema), auth.login);
router.get('/auth/me', protect, auth.me);
router.put('/auth/senha', limiteLogin, protect, validate(S.senhaSchema), auth.alterarSenha);

// Categorias
router.get('/categorias', optionalAuth, cat.listar);
router.put('/categorias/reordenar', adminOnly, cat.reordenar);
router.post('/categorias', adminOnly, validate(S.categoriaSchema), cat.criar);
router.put('/categorias/:id', adminOnly, id, validate(S.categoriaSchema), cat.atualizar);
router.delete('/categorias/:id', adminOnly, id, cat.excluir);

// Produtos
router.get('/produtos', prod.listar);
router.get('/produtos/:id', id, prod.obter);
router.post('/produtos', adminOnly, validate(S.produtoSchema), prod.criar);
router.put('/produtos/:id', adminOnly, id, validate(S.produtoSchema), prod.atualizar);
router.patch('/produtos/:id/disponibilidade', adminOnly, id, prod.alternarDisponibilidade);
router.delete('/produtos/:id', adminOnly, id, prod.excluir);

// Pedidos
router.post('/pedidos', limiteEnvio, validate(S.pedidoSchema), ped.criar);
router.get('/pedidos/acompanhar/:numero', limiteEnvio, ped.acompanhar);
router.get('/pedidos', adminOnly, ped.listar);
router.get('/pedidos/:id', adminOnly, id, ped.obter);
router.put('/pedidos/:id/status', adminOnly, id, validate(S.statusSchema), ped.atualizarStatus);

// Configurações
router.get('/configuracoes', pub.obterConfiguracoes);
router.put('/configuracoes', adminOnly, validate(S.configuracoesSchema), pub.atualizarConfiguracoes);

// Contato e avaliações (públicas, com limite de requisições)
router.post('/contato', limiteEnvio, validate(S.contatoSchema), pub.enviarContato);
router.get('/avaliacoes', pub.listarAvaliacoes);
router.post('/avaliacoes', limiteEnvio, validate(S.avaliacaoSchema), pub.enviarAvaliacao);

// Administração
router.get('/admin/dashboard', adminOnly, admin.dashboard);
router.get('/admin/mensagens', adminOnly, admin.listarMensagens);
router.put('/admin/mensagens/:id', adminOnly, id, admin.marcarMensagem);
router.delete('/admin/mensagens/:id', adminOnly, id, admin.excluirMensagem);
router.get('/admin/avaliacoes', adminOnly, admin.listarAvaliacoesAdmin);
router.put('/admin/avaliacoes/:id', adminOnly, id, admin.moderarAvaliacao);
router.delete('/admin/avaliacoes/:id', adminOnly, id, admin.excluirAvaliacao);

router.post('/admin/upload', adminOnly, (req, res, next) =>
  uploadImagem(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  })
);

export default router;
