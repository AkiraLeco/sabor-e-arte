// DADOS DEMONSTRATIVOS — usados somente para testes. Pratos, preços e fotos são ilustrativos
// (fotos do Unsplash). Substitua tudo pelo conteúdo real do restaurante no painel administrativo.

// Fotos salvas localmente em client/public/images (origem: Unsplash, uso ilustrativo)
const foto = (id) => `/images/${id}.jpg`;

export const categorias = [
  { nome: 'Pratos principais', descricao: 'Receitas autorais da casa' },
  { nome: 'Pratos executivos', descricao: 'Prato, acompanhamentos e sabor para o dia a dia' },
  { nome: 'Massas', descricao: 'Massas frescas e molhos artesanais' },
  { nome: 'Carnes', descricao: 'Cortes selecionados, grelhados no ponto' },
  { nome: 'Hambúrgueres', descricao: 'Blends artesanais no pão brioche' },
  { nome: 'Porções', descricao: 'Para compartilhar à mesa' },
  { nome: 'Saladas', descricao: 'Leves, frescas e completas' },
  { nome: 'Sobremesas', descricao: 'O final perfeito' },
  { nome: 'Bebidas', descricao: 'Sucos, limonadas e drinks sem álcool' },
  { nome: 'Combos e promoções', descricao: 'Mais sabor pelo melhor preço' },
];

const ad = (nome, preco) => ({ nome, preco });

export const produtos = [
  // Pratos principais
  {
    cat: 'Pratos principais', nome: 'Salmão Grelhado com Legumes', preco: 54.9, vendas: 48,
    imagem: foto('1519708227418-c8fd9a32b7a2'), etiqueta: 'Prato do dia',
    descricao: 'Filé de salmão grelhado servido com legumes salteados na manteiga de ervas.',
    descricaoCompleta: 'Filé de salmão fresco grelhado na chapa, finalizado com manteiga de ervas e servido sobre cama de legumes salteados da estação. Acompanha arroz de amêndoas.',
    ingredientes: ['Limão siciliano', 'Ervas frescas', 'Amêndoas'],
    adicionais: [ad('Arroz extra', 8), ad('Molho de maracujá', 6), ad('Purê de batata-doce', 9)],
    emPromocao: true, precoPromocional: 49.9,
  },
  {
    cat: 'Pratos principais', nome: 'Costeleta Suína com Batatas Rústicas', preco: 46.9, vendas: 31,
    imagem: foto('1432139555190-58524dae6a55'),
    descricao: 'Costeleta suína suculenta com batatas rústicas douradas e brócolis.',
    descricaoCompleta: 'Costeleta suína selecionada, selada e assada lentamente, acompanhada de batatas rústicas com alecrim e brócolis ao alho.',
    ingredientes: ['Alecrim', 'Alho', 'Brócolis'],
    adicionais: [ad('Farofa crocante', 7), ad('Vinagrete', 5)],
  },
  {
    cat: 'Pratos principais', nome: 'Frango Grelhado ao Molho Especial', preco: 38.9, vendas: 27,
    imagem: foto('1476224203421-9ac39bcb3327'),
    descricao: 'Peito de frango grelhado com molho da casa e salada fresca.',
    descricaoCompleta: 'Peito de frango marinado em ervas, grelhado e servido com o molho especial da casa, salada de folhas e arroz branco.',
    ingredientes: ['Salada de folhas', 'Molho especial'],
    adicionais: [ad('Queijo gratinado', 6), ad('Batata frita', 12)],
  },
  // Executivos
  {
    cat: 'Pratos executivos', nome: 'Executivo de Bife com Fritas', preco: 32.9, vendas: 52,
    imagem: foto('1600891964092-4316c288032e'),
    descricao: 'Bife grelhado, batatas fritas, arroz e feijão.',
    descricaoCompleta: 'Bife grelhado no ponto de sua preferência, batatas fritas sequinhas, arroz soltinho e feijão temperado. Acompanha salada simples.',
    ingredientes: ['Salada', 'Cebola caramelizada'],
    adicionais: [ad('Ovo frito', 3), ad('Farofa', 4), ad('Suco natural 300 ml', 8)],
  },
  {
    cat: 'Pratos executivos', nome: 'Executivo de Frango com Arroz Temperado', preco: 28.9, vendas: 40,
    imagem: foto('1603133872878-684f208fb84b'),
    descricao: 'Arroz temperado com legumes e filé de frango grelhado.',
    descricaoCompleta: 'Arroz temperado com cenoura e cebolinha, filé de frango grelhado e salada do dia.',
    ingredientes: ['Cenoura', 'Cebolinha'],
    adicionais: [ad('Ovo frito', 3), ad('Suco natural 300 ml', 8)],
  },
  {
    cat: 'Pratos executivos', nome: 'Executivo de Peixe ao Molho', preco: 35.9, vendas: 18,
    imagem: foto('1467003909585-2f8a72700288'),
    descricao: 'Filé de peixe grelhado com molho de ervas e legumes.',
    descricaoCompleta: 'Filé de peixe branco grelhado, molho cremoso de ervas finas, legumes ao vapor e arroz branco.',
    ingredientes: ['Molho de ervas', 'Legumes'],
    adicionais: [ad('Purê de batata', 7)],
  },
  // Massas
  {
    cat: 'Massas', nome: 'Penne ao Sugo Tradicional', preco: 34.9, vendas: 36,
    imagem: foto('1621996346565-e3dbc646d9a9'),
    descricao: 'Penne com molho de tomates frescos, manjericão e parmesão.',
    descricaoCompleta: 'Penne al dente com molho sugo de tomates italianos maduros, azeite extravirgem, manjericão fresco e lascas de parmesão.',
    ingredientes: ['Manjericão', 'Parmesão', 'Alho'],
    adicionais: [ad('Parmesão extra', 4), ad('Almôndegas (3 un.)', 12), ad('Pimenta calabresa', 2)],
  },
  {
    cat: 'Massas', nome: 'Tagliatelle ao Ragu de Cogumelos', preco: 44.9, vendas: 29,
    imagem: foto('1551183053-bf91a1d81141'),
    descricao: 'Tagliatelle fresco com ragu cremoso de cogumelos e carne.',
    descricaoCompleta: 'Massa fresca artesanal com ragu de cogumelos frescos e carne cozida lentamente, finalizada com parmesão e salsinha.',
    ingredientes: ['Cogumelos', 'Salsinha', 'Parmesão'],
    adicionais: [ad('Parmesão extra', 4), ad('Molho extra', 6)],
  },
  {
    cat: 'Massas', nome: 'Farfalle ao Pesto com Tomatinhos', preco: 38.9, vendas: 22,
    imagem: foto('1473093295043-cdd812d0e601'),
    descricao: 'Farfalle ao pesto de manjericão com tomatinhos confitados.',
    descricaoCompleta: 'Farfalle ao molho pesto artesanal de manjericão e castanhas, tomatinhos confitados e rúcula.',
    ingredientes: ['Tomatinhos', 'Rúcula', 'Castanhas'],
    adicionais: [ad('Frango grelhado', 10), ad('Parmesão extra', 4)],
  },
  // Carnes
  {
    cat: 'Carnes', nome: 'Costela BBQ Defumada', preco: 69.9, vendas: 44,
    imagem: foto('1544025162-d76694265947'),
    descricao: 'Costela suína defumada lentamente com molho barbecue.',
    descricaoCompleta: 'Costela suína assada em baixa temperatura por 8 horas e finalizada com molho barbecue da casa. Acompanha batatas rústicas e tomate.',
    ingredientes: ['Molho barbecue', 'Tomate'],
    adicionais: [ad('Farofa', 5), ad('Vinagrete', 5), ad('Batata frita', 12)],
  },
  {
    cat: 'Carnes', nome: 'Fraldinha Grelhada Fatiada', preco: 58.9, vendas: 33,
    imagem: foto('1558030006-450675393462'),
    descricao: 'Fraldinha macia grelhada na brasa, fatiada na tábua.',
    descricaoCompleta: 'Fraldinha selecionada, grelhada na brasa e fatiada na hora. Acompanha arroz, farofa e vinagrete.',
    ingredientes: ['Vinagrete', 'Farofa'],
    adicionais: [ad('Queijo coalho', 9), ad('Mandioca frita', 12)],
  },
  {
    cat: 'Carnes', nome: 'Contrafilé ao Ponto com Molho Madeira', preco: 64.9, vendas: 25,
    imagem: foto('1529692236671-f1f6cf9683ba'),
    descricao: 'Contrafilé grelhado com molho madeira e batatas.',
    descricaoCompleta: 'Contrafilé de corte nobre grelhado ao ponto, molho madeira de redução e batatas sautée.',
    ingredientes: ['Molho madeira', 'Batatas'],
    adicionais: [ad('Cogumelos salteados', 10), ad('Ovo frito', 3)],
  },
  // Hambúrgueres
  {
    cat: 'Hambúrgueres', nome: 'Clássico Artesanal', preco: 32.9, vendas: 61,
    imagem: foto('1568901346375-23c9450c58cd'),
    descricao: 'Blend de 160 g, queijo, alface, tomate e molho da casa no brioche.',
    descricaoCompleta: 'Hambúrguer artesanal de 160 g, queijo prato derretido, alface, tomate e molho especial no pão brioche tostado. Acompanha batatas fritas.',
    ingredientes: ['Alface', 'Tomate', 'Cebola', 'Molho especial'],
    adicionais: [ad('Bacon crocante', 6), ad('Queijo extra', 5), ad('Ovo', 3), ad('Hambúrguer extra', 10)],
  },
  {
    cat: 'Hambúrgueres', nome: 'Duplo Cheddar Bacon', preco: 42.9, vendas: 57,
    imagem: foto('1571091718767-18b5b1457add'),
    descricao: 'Dois blends, cheddar cremoso, bacon e cebola caramelizada.',
    descricaoCompleta: 'Dois hambúrgueres de 120 g, cheddar cremoso, bacon crocante, cebola caramelizada e maionese defumada. Acompanha batatas fritas.',
    ingredientes: ['Cebola caramelizada', 'Maionese defumada', 'Bacon'],
    adicionais: [ad('Bacon extra', 6), ad('Cheddar extra', 5), ad('Picles', 2)],
    emPromocao: true, precoPromocional: 36.9, etiqueta: 'Oferta',
  },
  {
    cat: 'Hambúrgueres', nome: 'Trio de Mini Burgers', preco: 36.9, vendas: 34,
    imagem: foto('1550547660-d9450f859349'),
    descricao: 'Três mini burgers com queijo e molho especial.',
    descricaoCompleta: 'Três mini burgers de 70 g no pão brioche com queijo derretido e molho especial. Ideal para dividir.',
    ingredientes: ['Molho especial', 'Alface'],
    adicionais: [ad('Batata frita', 12), ad('Bacon', 5)],
  },
  // Porções
  {
    cat: 'Porções', nome: 'Almôndegas ao Molho Pomodoro', preco: 36.9, vendas: 24,
    imagem: foto('1529042410759-befb1204b468'),
    descricao: 'Almôndegas caseiras ao molho de tomate sobre folhas de rúcula.',
    descricaoCompleta: 'Dez almôndegas caseiras ao molho pomodoro, servidas sobre folhas de rúcula. Acompanha pão italiano.',
    ingredientes: ['Rúcula', 'Pão italiano'],
    adicionais: [ad('Queijo gratinado', 6)],
  },
  {
    cat: 'Porções', nome: 'Tostex Grill com Maionese Verde', preco: 28.9, vendas: 15,
    imagem: foto('1528735602780-2552fd46c7af'),
    descricao: 'Sanduíches grelhados de queijo e presunto com maionese verde.',
    descricaoCompleta: 'Porção de sanduíches grelhados na chapa, recheados com queijo e presunto, acompanhados de maionese verde caseira e molho.',
    ingredientes: ['Maionese verde', 'Presunto'],
    adicionais: [ad('Molho extra', 3)],
  },
  // Saladas
  {
    cat: 'Saladas', nome: 'Buddha Bowl Colorido', preco: 34.9, vendas: 28,
    imagem: foto('1512621776951-a57141f2eefd'),
    descricao: 'Grão-de-bico, abacate, batata-doce, folhas e molho de limão.',
    descricaoCompleta: 'Bowl vegano com grão-de-bico, abacate, batata-doce assada, repolho roxo, tomate e folhas, com molho cítrico de limão e azeite.',
    ingredientes: ['Abacate', 'Grão-de-bico', 'Repolho roxo', 'Tomate'],
    adicionais: [ad('Frango grelhado', 10), ad('Ovo cozido', 3)],
  },
  {
    cat: 'Saladas', nome: 'Poke Bowl de Frango', preco: 36.9, vendas: 20,
    imagem: foto('1546069901-ba9599a7e63c'),
    descricao: 'Arroz, frango, milho, ovo, folhas e molho oriental.',
    descricaoCompleta: 'Base de arroz japonês, frango grelhado, milho, ovo cozido, repolho roxo e folhas verdes com molho oriental suave.',
    ingredientes: ['Milho', 'Ovo', 'Repolho roxo'],
    adicionais: [ad('Abacate', 6), ad('Gergelim', 2)],
  },
  {
    cat: 'Saladas', nome: 'Salada de Folhas com Bife', preco: 39.9, vendas: 17,
    imagem: foto('1504674900247-0877df9cc836'),
    descricao: 'Mix de folhas com tiras de bife, castanhas e molho de mostarda.',
    descricaoCompleta: 'Mix de folhas frescas, tiras de bife grelhado, castanhas de caju e molho de mostarda e mel.',
    ingredientes: ['Castanhas', 'Molho de mostarda e mel'],
    adicionais: [ad('Queijo parmesão', 4)],
  },
  // Sobremesas
  {
    cat: 'Sobremesas', nome: 'Bolo de Chocolate com Ganache', preco: 18.9, vendas: 46,
    imagem: foto('1578985545062-69928b1d9587'),
    descricao: 'Fatia generosa de bolo de chocolate com cobertura de ganache.',
    descricaoCompleta: 'Bolo úmido de chocolate meio amargo recheado e coberto com ganache cremosa. Fatia individual.',
    ingredientes: [],
    adicionais: [ad('Bola de sorvete', 6), ad('Calda de frutas vermelhas', 4)],
  },
  {
    cat: 'Sobremesas', nome: 'Torta de Frutas Vermelhas', preco: 19.9, vendas: 23,
    imagem: foto('1565958011703-44f9829ba187'),
    descricao: 'Fatia de torta cremosa com frutas vermelhas frescas.',
    descricaoCompleta: 'Massa amanteigada, creme leve de baunilha e cobertura de framboesas e morangos frescos. Fatia individual.',
    ingredientes: [],
    adicionais: [ad('Bola de sorvete', 6)],
  },
  {
    cat: 'Sobremesas', nome: 'Donuts Confeitados (2 un.)', preco: 14.9, vendas: 19,
    imagem: foto('1551024601-bec78aea704b'),
    descricao: 'Dois donuts artesanais com cobertura e confeitos coloridos.',
    descricaoCompleta: 'Dois donuts artesanais fofinhos, com cobertura de chocolate e confeitos coloridos.',
    ingredientes: [],
    adicionais: [ad('Donut extra', 7)],
  },
  // Bebidas
  {
    cat: 'Bebidas', nome: 'Limonada com Hortelã', preco: 10.9, vendas: 38,
    imagem: foto('1513558161293-cdaf765ed2fd'),
    descricao: 'Limonada gelada com folhas de hortelã e gelo.',
    descricaoCompleta: 'Limonada natural feita na hora, com hortelã fresca e bastante gelo. Copo de 400 ml.',
    ingredientes: ['Gelo', 'Açúcar'],
    adicionais: [ad('Copo de 500 ml', 3)],
  },
  {
    cat: 'Bebidas', nome: 'Suco Natural de Laranja', preco: 9.9, vendas: 30,
    imagem: foto('1606787366850-de6330128bfc'),
    descricao: 'Suco de laranja espremido na hora, 400 ml.',
    descricaoCompleta: 'Laranjas selecionadas espremidas na hora, sem adição de açúcar. Copo de 400 ml.',
    ingredientes: ['Gelo'],
    adicionais: [],
  },
  {
    cat: 'Bebidas', nome: 'Drink Cítrico Sem Álcool', preco: 16.9, vendas: 12, disponivel: false,
    imagem: foto('1544145945-f90425340c7e'),
    descricao: 'Drink de frutas cítricas, refrescante e sem álcool.',
    descricaoCompleta: 'Mix de frutas cítricas, xarope artesanal, gelo e rodela de limão. Sem álcool.',
    ingredientes: ['Gelo'],
    adicionais: [],
  },
  // Combos
  {
    cat: 'Combos e promoções', nome: 'Combo Casal', preco: 99.9, vendas: 35,
    imagem: foto('1424847651672-bf20a4b0982b'), etiqueta: 'Combo',
    descricao: 'Dois pratos principais, uma porção e duas bebidas.',
    descricaoCompleta: 'Dois pratos principais à escolha do chef, uma porção para dividir e duas bebidas (limonada ou suco). Ideal para dois.',
    ingredientes: [],
    adicionais: [ad('Sobremesa para dois', 24)],
    emPromocao: true, precoPromocional: 84.9,
  },
  {
    cat: 'Combos e promoções', nome: 'Combo Executivo + Sobremesa', preco: 44.9, vendas: 26,
    imagem: foto('1414235077428-338989a2e8c0'), etiqueta: 'Combo',
    descricao: 'Prato executivo do dia, suco natural e sobremesa.',
    descricaoCompleta: 'Prato executivo do dia, suco natural de 300 ml e uma sobremesa individual. Válido para almoço.',
    ingredientes: [],
    adicionais: [],
    emPromocao: true, precoPromocional: 38.9,
  },
  {
    cat: 'Combos e promoções', nome: 'Combo Brunch da Casa', preco: 57.9, vendas: 14,
    imagem: foto('1493770348161-369560ae357d'), etiqueta: 'Oferta limitada',
    descricao: 'Bowls de frutas, torradas, ovos e suco para o brunch.',
    descricaoCompleta: 'Seleção para o brunch: bowl de frutas com granola, torradas com ovos mexidos, panqueca e suco natural.',
    ingredientes: [],
    adicionais: [],
    emPromocao: true, precoPromocional: 49.9,
  },
];

// EXEMPLOS DEMONSTRATIVOS: aparecem no site identificados como tal e NÃO são avaliações reais.
export const avaliacoesDemo = [
  { nome: 'Exemplo de cliente A', nota: 5, comentario: 'Texto de exemplo para demonstrar o carrossel de depoimentos do site.' },
  { nome: 'Exemplo de cliente B', nota: 5, comentario: 'Texto de exemplo: aqui aparecerão as avaliações reais, após aprovação no painel.' },
  { nome: 'Exemplo de cliente C', nota: 4, comentario: 'Texto de exemplo para testar o layout com avaliações de comprimentos diferentes.' },
];
