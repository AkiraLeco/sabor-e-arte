# Sabor & Arte — Restaurante com cardápio digital e pedidos online

Site institucional + cardápio interativo + carrinho + checkout + painel administrativo, com backend próprio e banco de dados.

> **Atenção — conteúdo demonstrativo.** O nome "Sabor & Arte", os textos institucionais, os pratos, preços, endereço, telefone e as fotos (banco de imagens Unsplash, salvas localmente) são **exemplos para teste**. Os 3 depoimentos iniciais são marcados no site como *"Exemplo demonstrativo · não é uma avaliação real"*. Troque tudo pelo conteúdo real do restaurante no painel administrativo. Nenhum número de WhatsApp real foi incluído.

## Tecnologias

| Camada | Stack |
| --- | --- |
| Frontend | React 18, Vite, React Router, Framer Motion, Lucide React, CSS3 puro |
| Backend | Node.js, Express 4, Mongoose (MongoDB), JWT, bcryptjs, Zod, Helmet, express-rate-limit, Multer |
| Banco | MongoDB **embutido e local** (arquivos em `server/data`), sem instalar nem conectar nada externo |

## Estrutura

```
.
├─ client/                 Frontend (Vite + React)
│  └─ src/
│     ├─ components/       Header, Footer, CartDrawer, ProductCard/Modal, ui.jsx, home/*
│     ├─ pages/            Home, Cardapio, Checkout, Pedido, admin/*
│     ├─ context/          Carrinho (localStorage), Configurações, Auth, Toasts
│     ├─ hooks/            useFetch (com polling), useSeo
│     ├─ services/         api.js, format.js, whatsapp.js, storage.js
│     └─ styles/           global.css, site.css, admin.css
├─ server/                 API REST (Express)
│  ├─ config/              env.js, db.js
│  ├─ models/              Category, Product, Order, Settings, User, Message, Review, Counter
│  ├─ controllers/         lógica de cada recurso
│  ├─ routes/index.js      todas as rotas
│  ├─ middlewares/         auth (JWT), validate (Zod), sanitize, upload, error
│  ├─ services/            orderService (cálculo seguro), bootstrap/seedData
│  ├─ scripts/admin.js     cria/redefine o administrador
│  ├─ seed.js              carrega os dados demonstrativos
│  └─ server.js
├─ .env.example
└─ package.json            scripts da raiz
```

## Requisitos

- **Node.js 18+** (testado com Node 24)
- **Nenhum banco para instalar.** O projeto usa um MongoDB embutido que grava na pasta `server/data`. Na primeira execução o pacote baixa o binário do MongoDB uma única vez (~100 MB, precisa de internet); depois funciona offline.
- Os dados (pedidos, produtos editados, uploads) **persistem entre execuções**. Para voltar ao zero, pare a API e apague `server/data` (e `server/uploads`, se quiser).
- Opcional: para usar um MongoDB externo (local/Atlas), defina `USE_LOCAL_DB=false` e `MONGODB_URI` no `.env`.

## Instalação

```bash
# 1. dependências da raiz, do servidor e do cliente
npm run install:all

# 2. variáveis de ambiente
cp .env.example .env        # no Windows (PowerShell): Copy-Item .env.example .env
#    (opcional) edite o .env: JWT_SECRET, ADMIN_*, WHATSAPP_NUMBER

```

Não há passo de banco: na primeira vez que a API sobe, ela cria o banco local, o usuário admin e carrega os dados demonstrativos sozinha. (`npm run seed` só é necessário para restaurar o cardápio demonstrativo depois; pare a API antes, pois o banco embutido aceita um processo por vez.)

## Executar

```bash
npm run dev          # API (http://localhost:5000) + site (http://localhost:5173)
```

Ou separadamente: `npm run dev:server` e `npm run dev:client`.

- Site: <http://localhost:5173>
- Painel: <http://localhost:5173/admin>
- API: <http://localhost:5000/api>

### Produção (um único processo)

```bash
npm run build        # gera client/dist
NODE_ENV=production npm start   # a API serve também o site compilado em http://localhost:5000
```

Em produção o servidor **recusa iniciar** se `JWT_SECRET` tiver menos de 32 caracteres e não cria o admin com a senha padrão.

## Credenciais administrativas (somente desenvolvimento)

| Campo | Valor padrão |
| --- | --- |
| E-mail | `admin@restaurante.local` |
| Senha | `Admin@123456` |

**Como alterar** (faça antes de publicar):

1. Pelo painel: *Configurações → Segurança: alterar senha*.
2. Pelo terminal (com a API parada): `npm run admin -- novo@email.com "NovaSenha123"` (cria ou redefine o administrador; mín. 8 caracteres com letras e números).
3. Antes do primeiro start: defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`.

## WhatsApp

Informe o número (somente dígitos, DDI + DDD + número, ex.: `55` + DDD + número) em **Configurações → WhatsApp** ou em `WHATSAPP_NUMBER` no `.env`. Sem número, o botão flutuante e as opções de envio ficam ocultos. O cliente pode **confirmar e enviar o pedido pelo WhatsApp**: o pedido é registrado no banco (recebe número `PED-00001`) e abre-se a conversa com a mensagem pronta (cliente, itens, adicionais, observações, endereço, pagamento e total).

## Funcionalidades

**Site público** — Hero e seções (sobre, promoções com prato do dia / combos / mais vendidos, galeria com lightbox, depoimentos em carrossel, localização com Google Maps, contato) · **Cardápio**: categorias dinâmicas, busca, ordenação por preço, filtros "em promoção" e "mais vendidos", modal com adicionais pagos, remoção de ingredientes, observações, quantidade e preço em tempo real · **Carrinho** em drawer, salvo no `localStorage`, com contador · **Checkout** (entrega, retirada ou consumo no local; Pix, dinheiro com troco, crédito, débito; revisão antes de confirmar) · **Acompanhamento** do pedido com atualização automática (a cada 15 s).

**Painel admin** — Dashboard (pedidos, faturamento, mais vendidos, gráfico de 7 dias) · Pedidos (filtros, detalhes, troca de status, aviso de novos pedidos; atualização a cada 10 s) · Produtos (CRUD, upload de imagem, adicionais, promoção com validade, disponibilidade, prato do dia) · Categorias (CRUD e reordenação) · Mensagens de contato e moderação de avaliações · Configurações (identidade, contato, horários, taxas por bairro, pedido mínimo, entrega grátis acima de X, formas de pagamento, tipos de pedido, chave Pix) · Troca de senha.

## Segurança

- **Preços nunca vêm do navegador**: o servidor recalcula itens, adicionais, taxa de entrega, total e troco a partir do banco (`server/services/orderService.js`). Totais/preços enviados são ignorados.
- Senhas com **bcrypt** (custo 12); autenticação **JWT** (expira em 8 h); rotas administrativas protegidas.
- Validação de todas as entradas com **Zod**; sanitização contra NoSQL injection (remove chaves `$`/`.`).
- **Helmet** (CSP, nosniff, HSTS em produção), CORS restrito, limite de corpo (100 KB), **rate limit** global e mais rígido em login, pedidos e formulários.
- Upload restrito a imagens (JPG/PNG/WEBP/GIF, até 3 MB) com nome aleatório.
- Acompanhamento público exige **número do pedido + telefone**.
- Mensagens de erro de login genéricas; nenhum segredo é exposto ao frontend.

## Documentação da API

Base: `/api`. Erros retornam `{ "erro": "mensagem", "detalhes": [...] }`. Rotas 🔒 exigem `Authorization: Bearer <token>`.

### Autenticação
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/auth/login` | `{ email, senha }` → `{ token, usuario }` |
| GET | `/auth/me` 🔒 | Usuário autenticado |
| PUT | `/auth/senha` 🔒 | `{ senhaAtual, novaSenha }` |

### Produtos
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/produtos` | Query: `categoria` (id ou slug), `q`, `promocao=true`, `maisVendidos=true`, `ordem=menor_preco\|maior_preco` |
| GET | `/produtos/:id` | Detalhe |
| POST | `/produtos` 🔒 | Cria (`nome, preco, categoria, descricao, imagem, adicionais[], ingredientes[], emPromocao, precoPromocional, promocaoAte, disponivel, etiqueta`) |
| PUT | `/produtos/:id` 🔒 | Atualiza |
| PATCH | `/produtos/:id/disponibilidade` 🔒 | Alterna disponível/indisponível |
| DELETE | `/produtos/:id` 🔒 | Exclui |

### Categorias
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/categorias` | Lista ativas (com token + `?todas=true` inclui ocultas) |
| POST | `/categorias` 🔒 | `{ nome, descricao, ativa }` |
| PUT | `/categorias/:id` 🔒 | Atualiza |
| PUT | `/categorias/reordenar` 🔒 | `{ ids: [...] }` na nova ordem |
| DELETE | `/categorias/:id` 🔒 | Bloqueia se houver produtos |

### Pedidos
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/pedidos` | Cria pedido. Body: `cliente{nome,telefone}`, `tipo`, `endereco{rua,numero,complemento,bairro}`, `itens[{produtoId,quantidade,adicionaisIds[],removidos[],observacao}]`, `pagamento{forma,troco}`, `observacoes` |
| GET | `/pedidos/acompanhar/:numero?telefone=` | Consulta pública do status |
| GET | `/pedidos` 🔒 | Lista (`status`, `q`, `limite`) |
| GET | `/pedidos/:id` 🔒 | Detalhe |
| PUT | `/pedidos/:id/status` 🔒 | `{ status }`: `aguardando_confirmacao`, `confirmado`, `em_preparacao`, `pronto_retirada`, `saiu_entrega`, `concluido`, `cancelado` |

### Configurações, contato, avaliações, administração
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/configuracoes` | Dados públicos do restaurante (inclui prato do dia) |
| PUT | `/configuracoes` 🔒 | Atualiza configurações |
| POST | `/contato` | `{ nome, email, telefone, assunto, mensagem }` |
| GET / POST | `/avaliacoes` | Lista aprovadas / envia (fica pendente de moderação) |
| GET | `/admin/dashboard` 🔒 | Indicadores |
| GET/PUT/DELETE | `/admin/mensagens[/:id]` 🔒 | Mensagens de contato |
| GET/PUT/DELETE | `/admin/avaliacoes[/:id]` 🔒 | Moderação de avaliações |
| POST | `/admin/upload` 🔒 | `multipart/form-data` campo `imagem` → `{ url }` |

## Dados demonstrativos

`npm run seed` recria **10 categorias, 29 produtos** (com adicionais, ingredientes removíveis, promoções e vendas fictícias para exibir "mais vendidos") e 3 avaliações de exemplo. Pedidos e usuários existentes são preservados. Os dados estão em `server/services/seedData.js`.

## Observações

- O mapa usa o endereço cadastrado (embed do Google Maps sem chave de API); opcionalmente cole uma URL de incorporação em Configurações.
- As fotos de exemplo (Unsplash, uso ilustrativo) estão salvas em `client/public/images`, então o site não depende de internet para as imagens. Troque-as pelas suas no painel (Produtos → Enviar) ou substituindo os arquivos.
- Arquivos enviados ficam em `server/uploads/` (faça backup/volume persistente em produção).
- O pagamento Pix/cartão é **registrado**, não processado: a cobrança é feita pelo restaurante na entrega/retirada, ou via chave Pix exibida ao cliente.
