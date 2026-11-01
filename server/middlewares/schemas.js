import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'identificador inválido');
const texto = (max, min = 0) => z.string().trim().min(min).max(max);
const dinheiro = z.coerce.number().min(0).max(100000);
const telefone = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v.length >= 10 && v.length <= 13, 'telefone inválido (use DDD + número)');
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'hora inválida').or(z.literal(''));
const urlOuCaminho = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || v.startsWith('/uploads/') || v.startsWith('/images/') || /^https?:\/\//i.test(v), 'use uma URL http(s) ou envie um arquivo');

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('e-mail inválido'),
  senha: z.string().min(1, 'informe a senha').max(100),
});

export const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'informe a senha atual').max(100),
  novaSenha: z
    .string()
    .min(8, 'use ao menos 8 caracteres')
    .max(100)
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'use letras e números'),
});

export const categoriaSchema = z.object({
  nome: texto(60, 2),
  descricao: texto(200).optional().default(''),
  ativa: z.boolean().optional().default(true),
});

export const produtoSchema = z
  .object({
    nome: texto(100, 2),
    descricao: texto(400).optional().default(''),
    descricaoCompleta: texto(1500).optional().default(''),
    preco: dinheiro,
    categoria: objectId,
    imagem: urlOuCaminho.optional().default(''),
    disponivel: z.boolean().optional().default(true),
    emPromocao: z.boolean().optional().default(false),
    precoPromocional: dinheiro.nullable().optional().default(null),
    promocaoAte: z.coerce.date().nullable().optional().default(null),
    etiqueta: texto(30).optional().default(''),
    ingredientes: z.array(texto(40, 1)).max(20).optional().default([]),
    adicionais: z
      .array(z.object({ nome: texto(60, 1), preco: dinheiro }))
      .max(20)
      .optional()
      .default([]),
  })
  .refine((p) => !p.emPromocao || (p.precoPromocional != null && p.precoPromocional < p.preco), {
    message: 'o preço promocional deve ser menor que o preço normal',
    path: ['precoPromocional'],
  });

export const pedidoSchema = z.object({
  cliente: z.object({ nome: texto(80, 3), telefone }),
  tipo: z.enum(['entrega', 'retirada', 'local']),
  endereco: z
    .object({
      rua: texto(120).optional().default(''),
      numero: texto(15).optional().default(''),
      complemento: texto(60).optional().default(''),
      bairro: texto(60).optional().default(''),
    })
    .optional()
    .default({}),
  itens: z
    .array(
      z.object({
        produtoId: objectId,
        quantidade: z.coerce.number().int().min(1).max(50),
        adicionaisIds: z.array(objectId).max(20).optional().default([]),
        removidos: z.array(texto(40)).max(20).optional().default([]),
        observacao: texto(200).optional().default(''),
      })
    )
    .min(1, 'o carrinho está vazio')
    .max(50),
  pagamento: z.object({
    forma: z.enum(['pix', 'dinheiro', 'credito', 'debito']),
    troco: dinheiro.nullable().optional().default(null),
  }),
  observacoes: texto(300).optional().default(''),
});

export const statusSchema = z.object({
  status: z.enum([
    'aguardando_confirmacao', 'confirmado', 'em_preparacao',
    'pronto_retirada', 'saiu_entrega', 'concluido', 'cancelado',
  ]),
});

export const contatoSchema = z.object({
  nome: texto(80, 2),
  email: z.string().trim().toLowerCase().email('e-mail inválido'),
  telefone: z.string().trim().max(20).optional().default(''),
  assunto: texto(120).optional().default(''),
  mensagem: texto(2000, 10),
});

export const avaliacaoSchema = z.object({
  nome: texto(60, 2),
  nota: z.coerce.number().int().min(1).max(5),
  comentario: texto(500, 10),
});

export const configuracoesSchema = z.object({
  nome: texto(60, 2),
  slogan: texto(100).optional().default(''),
  logo: urlOuCaminho.optional().default(''),
  descricao: texto(500).optional().default(''),
  endereco: texto(150).optional().default(''),
  cidade: texto(80).optional().default(''),
  telefone: texto(25).optional().default(''),
  whatsapp: z.string().trim().transform((v) => v.replace(/\D/g, '')).refine((v) => v === '' || (v.length >= 12 && v.length <= 13), 'use DDI + DDD + número (ex.: 5511999999999)').optional().default(''),
  instagram: texto(60).optional().default(''),
  email: z.string().trim().email().or(z.literal('')).optional().default(''),
  mapaUrl: z.string().trim().max(800).refine((v) => v === '' || /^https:\/\/www\.google\.com\/maps(\/embed)?[/?]/i.test(v), 'use uma URL de incorporação do Google Maps (https://www.google.com/maps/embed...)').optional().default(''),
  horarios: z.array(z.object({ dia: texto(40, 1), abre: hora, fecha: hora, fechado: z.boolean().optional().default(false) })).max(10),
  taxaEntregaPadrao: dinheiro,
  taxasPorBairro: z.array(z.object({ bairro: texto(60, 1), taxa: dinheiro })).max(100).optional().default([]),
  entregaGratisAcimaDe: dinheiro.optional().default(0),
  pedidoMinimo: dinheiro.optional().default(0),
  pagamentos: z.object({ pix: z.boolean(), dinheiro: z.boolean(), credito: z.boolean(), debito: z.boolean() }),
  tiposPedido: z.object({ entrega: z.boolean(), retirada: z.boolean(), local: z.boolean() }),
  pratoDoDia: objectId.nullable().optional().default(null),
  chavePix: texto(100).optional().default(''),
});
