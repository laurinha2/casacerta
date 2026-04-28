// ===== DADOS MOCKADOS - CASA CERTA IMOBILIÁRIA =====
 
/*const imoveis = [
  {
    id: 1,
    nome: "Casa Aconchegante",
    tipo: "casa",
    finalidade: "compra",
    bairro: "Jardim das Flores",
    cidade: "Curitiba",
    preco: 420000,
    area: 376,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    piscina: true,
    destaque: true,
    imagem: "img/pexels-cmoon-12558933.jpg",
    galeria: [
      "img/pexels-taryn-elliott-9565727.jpg",
      "img/pexels-jonathanborba-10115004.jpg",
      "img/pexels-rods-aguiar-2154709933-34208343.jpg",
      "img/pexels-curtis-adams-1694007-7028124.jpg"
    ],
    descricao: "Casa espaçosa com 376 m², ideal para quem busca conforto e lazer. O imóvel conta com 3 quartos, 2 banheiros, cozinha ampla e 2 vagas de garagem. Na área externa, possui piscina, perfeita para momentos de descanso e diversão com a família.",
    extras: ["Cozinha Ampla", "Piscina"],
    lat: -25.4284,
    lng: -49.2733
  },
  {
    id: 2,
    nome: "Apartamento Residencial Primavera",
    tipo: "apartamento",
    finalidade: "compra",
    bairro: "Vila Nova",
    cidade: "Curitiba",
    preco: 560000,
    area: 289,
    quartos: 2,
    banheiros: 2,
    vagas: 1,
    piscina: false,
    destaque: true,
    imagem: "img/pexels-jonathanborba-10115004.jpg",
    galeria: [
      "img/pexels-rods-aguiar-2154709933-34208343.jpg",
      "img/pexels-dropshado-2251247.jpg",
      "img/pexels-tiffanychristiefreeman-34981262.jpg",
      "img/pexels-taryn-elliott-9565727.jpg"
    ],
    descricao: "Apartamento moderno no coração de Vila Nova, com 289 m² de área total. Acabamentos de alto padrão, varanda gourmet e vista panorâmica da cidade. Excelente localização próximo a comércios, escolas e transporte público.",
    extras: ["Varanda Gourmet", "Portaria 24h"],
    lat: -25.4350,
    lng: -49.2800
  },
  {
    id: 3,
    nome: "Apartamento Edifício Parque Central",
    tipo: "apartamento",
    finalidade: "compra",
    bairro: "Jardim Aurora",
    cidade: "Porto Alegre",
    preco: 310000,
    area: 92,
    quartos: 3,
    banheiros: 2,
    vagas: 1,
    piscina: false,
    destaque: true,
    imagem: "img/pexels-sergio-monsalve-2155362348-34720098.jpg",
    galeria: [
      "img/pexels-capturavisualmoment-34717361.jpg",
      "img/pexels-aysenurhamra-68268085-11120970.jpg",
      "img/pexels-curtis-adams-1694007-7028124.jpg",
      "img/pexels-dropshado-2251247.jpg"
    ],
    descricao: "Apartamento bem localizado no Jardim Aurora com 92 m², 3 quartos amplos, 2 banheiros completos e 1 vaga de garagem. Condomínio com segurança 24h, churrasqueira e salão de festas.",
    extras: ["Churrasqueira", "Salão de Festas"],
    lat: -30.0568,
    lng: -51.1787
  },
  {
    id: 4,
    nome: "Casa Moderna com Piscina",
    tipo: "casa",
    finalidade: "compra",
    bairro: "Alphaville",
    cidade: "Porto Alegre",
    preco: 890000,
    area: 520,
    quartos: 4,
    banheiros: 4,
    vagas: 3,
    piscina: true,
    destaque: false,
    imagem: "img/pexels-diego-romero-471613950-20512825.jpg",
    galeria: [
      "img/pexels-jens-f-2153787630-33097437.jpg",
      "img/pexels-capturavisualmoment-34717361.jpg",
      "img/pexels-rods-aguiar-2154709933-34208343.jpg",
      "img/pexels-tiffanychristiefreeman-34981262.jpg"
    ],
    descricao: "Residência de alto padrão em condomínio fechado. 520 m² de sofisticação com 4 suítes, piscina, home theater e cozinha gourmet equipada. Segurança 24h e área verde preservada.",
    extras: ["Piscina", "Home Theater", "Cozinha Gourmet"],
    lat: -30.0280,
    lng: -51.2167
  },
  {
    id: 5,
    nome: "Studio Aconchegante Centro",
    tipo: "apartamento",
    finalidade: "aluguel",
    bairro: "Centro",
    cidade: "Curitiba",
    preco: 1800,
    area: 38,
    quartos: 1,
    banheiros: 1,
    vagas: 0,
    piscina: false,
    destaque: false,
    imagem: "img/pexels-tiffanychristiefreeman-34981262.jpg",
    galeria: [
      "img/pexels-taryn-elliott-9565727.jpg",
      "img/pexels-dropshado-2251247.jpg",
      "img/pexels-curtis-adams-1694007-7028124.jpg",
      "img/pexels-aysenurhamra-68268085-11120970.jpg"
    ],
    descricao: "Studio moderno e funcional de 38 m² no centro de Curitiba. Ideal para profissionais e universitários. Todo mobiliado, próximo a universidades, metrô e restaurantes.",
    extras: ["Mobiliado", "Academia", "Lavanderia"],
    lat: -25.4290,
    lng: -49.2710
  },
  {
    id: 6,
    nome: "Cobertura Duplex Premium",
    tipo: "cobertura",
    finalidade: "compra",
    bairro: "Moinhos de Vento",
    cidade: "Porto Alegre",
    preco: 1200000,
    area: 350,
    quartos: 3,
    banheiros: 3,
    vagas: 2,
    piscina: true,
    destaque: false,
    imagem: "img/pexels-capturavisualmoment-34717361.jpg",
    galeria: [
      "img/pexels-jens-f-2153787630-33097437.jpg",
      "img/pexels-jonathanborba-10115004.jpg",
      "img/pexels-rods-aguiar-2154709933-34208343.jpg",
      "img/pexels-sergio-monsalve-2155362348-34720098.jpg"
    ],
    descricao: "Cobertura duplex exclusiva com 350 m² e terraço privativo com piscina. Acabamento premium, 3 suítes com walk-in closet, sala de jantar para 20 pessoas e vista deslumbrante da cidade.",
    extras: ["Terraço Privativo", "Walk-in Closet", "Vista Panorâmica"],
    lat: -30.0235,
    lng: -51.1980
  }
];
 
function formatarPreco(valor, finalidade) {
  const formatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
  return finalidade === 'aluguel' ? formatado + '/mês' : formatado;
}
 
function getImoveisFiltrados({ finalidade, tipo, cidade, bairro } = {}) {
  return imoveis.filter(im => {
    if (finalidade && im.finalidade !== finalidade) return false;
    if (tipo && im.tipo !== tipo) return false;
    if (cidade && im.cidade !== cidade) return false;
    if (bairro && im.bairro !== bairro) return false;
    return true;
  });
}
 
function getImovelById(id) {
  return imoveis.find(im => im.id === parseInt(id));
}*/
 