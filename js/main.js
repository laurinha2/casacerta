// ===== MAIN.JS - Funcionalidades globais =====

// Variável global para armazenar os imóveis (usada no aplicarFiltros)
let imoveisBanco = [];

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.navbar-links');
  const paginaAtual = location.pathname.split('/').pop() || 'index.html';

  // 1. Carregar imóveis da API se estivermos na página correta
  if (paginaAtual === 'imoveis.html' || paginaAtual === 'aluguel.html') {
    carregarImoveisPeloBanco();
  }

  // 2. Menu hamburger (desktop e mobile)
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
    document.querySelectorAll('.navbar-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // 3. Marcar link ativo na navbar
  document.querySelectorAll('.navbar-links a').forEach(link => {
    if (link.getAttribute('href') === paginaAtual) link.classList.add('active');
  });

  // 4. Atualizar favoritos
  atualizarFavoritos().catch(() => { });
});

// ---- FAVORITOS ----
async function atualizarFavoritos() {
  const favoritosBanco = await getFavoritosBanco();
  document.querySelectorAll('.card-favorito').forEach(btn => {
    const id = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
    const adicionado = favoritosBanco.includes(id);
    btn.classList.toggle('ativo', adicionado);
    btn.textContent = adicionado ? '♥' : '♡';
  });
}

function isFavorito(id) {
  return false;
}

async function toggleFavorito(id) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuario) {
    alert('Você precisa estar logado para favoritar.');
    return false;
  }

  try {
    const res = await fetch(`${API}/favoritos/${usuario.id}`);
    const favoritos = await res.json();
    const jaExiste = favoritos.find(f => f == id);

    if (jaExiste) {
      await fetch(`${API}/favoritos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, imovel_id: id })
      });
      return false;
    } else {
      await fetch(`${API}/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, imovel_id: id })
      });
      return true;
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar favorito.');
    return false;
  }
}

// ---- RENDERIZAR CARD DE IMÓVEL ----
function renderCard(im) {
  return `
    <div class="card-imovel fade-up">
      <div class="card-img-wrap">
        <img src="${im.imagem}" alt="${im.nome}" loading="lazy">
        <button class="card-favorito" onclick="handleFavorito(${im.id}, this)" title="Favoritar">
          ♡
        </button>
      </div>
      <div class="card-body">
        <div class="card-nome">${im.nome}</div>
        <div class="card-local">📍 ${im.bairro} – ${im.cidade}</div>
        <div class="card-preco">${formatarPreco(im.preco, im.finalidade)}</div>
        <div class="card-specs">
          <span class="card-spec">🏠 ${im.area} m²</span>
          <span class="card-spec">🛏 ${im.quartos} quartos</span>
          <span class="card-spec">🚿 ${im.banheiros} banheiros</span>
          ${im.vagas > 0 ? `<span class="card-spec">🚗 ${im.vagas} vagas</span>` : ''}
        </div>
        <a href="detalhes.html?id=${im.id}" class="btn-primary card-btn" style="justify-content:center;">Ver Detalhes</a>
      </div>
    </div>
  `;
}

async function handleFavorito(id, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  const adicionado = await toggleFavorito(id);
  btn.disabled = false;
  btn.classList.toggle('ativo', adicionado);
  btn.textContent = adicionado ? '♥' : '♡';
}

// ---- SIMULADOR DE FINANCIAMENTO ----
function calcularFinanciamento(valor, entrada, prazoAnos, taxaAnual) {
  const principal = valor - entrada;
  if (principal <= 0) return { parcela: 0, total: 0, jurosTotal: 0 };
  const taxaMensal = taxaAnual / 100 / 12;
  const n = prazoAnos * 12;
  if (taxaMensal === 0) {
    const parcela = principal / n;
    return { parcela, total: principal, jurosTotal: 0 };
  }
  const parcela = principal * (taxaMensal * Math.pow(1 + taxaMensal, n)) / (Math.pow(1 + taxaMensal, n) - 1);
  const total = parcela * n;
  return { parcela, total, jurosTotal: total - principal };
}

// ---- CARREGAR DADOS DO USUÁRIO ----
async function carregarDados() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuario) return;
  try {
    const res = await fetch(`${API}/usuarios/${usuario.id}`);
    const dados = await res.json();
    const nomeEl = document.getElementById('nome');
    const emailEl = document.getElementById('email');
    const telefoneEl = document.getElementById('telefone');
    const cpfEl = document.getElementById('cpf_cnpj');
    if (nomeEl) nomeEl.value = dados.nome || '';
    if (emailEl) emailEl.value = dados.email || '';
    if (telefoneEl) telefoneEl.value = dados.telefone || '';
    if (cpfEl) cpfEl.value = dados.cpf_cnpj || '';
  } catch (err) {
    console.error('Erro ao carregar dados do usuário:', err);
  }
}

// ---- CARREGAR SIMULAÇÕES ----
async function carregarFinanciamentos() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuario) return;
  try {
    const res = await fetch(`${API}/simulacoes/${usuario.id}`);
    const simulacoes = await res.json();
    return simulacoes;
  } catch (err) {
    console.error('Erro ao carregar simulações:', err);
    return [];
  }
}

// ---- SALVAR SIMULAÇÃO ----
async function salvarSimulacao(dados) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuario) return;
  try {
    await fetch(`${API}/simulacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuario.id, ...dados })
    });
  } catch (err) {
    console.error('Erro ao salvar simulação:', err);
  }
}

// ---- DELETAR SIMULAÇÃO ----
async function deletarSimulacao(id) {
  try {
    await fetch(`${API}/simulacoes/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error('Erro ao deletar simulação:', err);
  }
}

// ---- FORMATAR PREÇO ----
function formatarPreco(preco, finalidade) {
  const valor = Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (finalidade === 'aluguel') return `${valor}/mês`;
  return valor;
}

// ---- CARREGAR IMÓVEIS DO BANCO ----
async function carregarImoveisPeloBanco() {
  const container = document.getElementById('lista-imoveis');
  if (!container) return;

  try {
    const res = await fetch(`${API}/imoveis/publicos`);
    const imoveis = await res.json();

    // popula a variável global com os campos corretos
    imoveisBanco = imoveis.map(im => ({
      id: im.id,
      nome: im.nome || im.tipo,              // usa "nome" do banco, fallback para "tipo"
      imagem: 'img/casa-padrao.jpg',
      bairro: im.bairro || im.endereco,      // garante bairro
      cidade: im.cidade,
      preco: Number(im.preco || im.valor) || 0, // garante que o preço seja preenchido
      finalidade: im.finalidade.toLowerCase(),
      area: im.area || '--',
      quartos: im.quartos || '--',
      banheiros: im.banheiros || '--',
      vagas: im.vagas || 0,
      descricao: im.descricao || ''
    }));

    // renderiza os imóveis filtrados
    aplicarFiltros();
  } catch (err) {
    console.error('Erro ao listar imóveis:', err);
    container.innerHTML = '<p>Erro ao carregar imóveis.</p>';
  }
}

// ---- RENDERIZAR CARD DE IMÓVEL ----
function renderCard(im) {
  return `
    <div class="card-imovel fade-up">
      <div class="card-img-wrap">
        <img src="${im.imagem}" alt="${im.nome}" loading="lazy">
        <button class="card-favorito" onclick="handleFavorito(${im.id}, this)" title="Favoritar">
          ♡
        </button>
      </div>
      <div class="card-body">
        <div class="card-nome">${im.nome}</div>
        <div class="card-local">📍 ${im.bairro} – ${im.cidade}</div>
        <div class="card-preco">${im.preco ? formatarPreco(im.preco, im.finalidade) : 'Preço não informado'}</div>
        <div class="card-specs">
          <span class="card-spec">🏠 ${im.area} m²</span>
          <span class="card-spec">🛏 ${im.quartos} quartos</span>
          <span class="card-spec">🚿 ${im.banheiros} banheiros</span>
          ${im.vagas > 0 ? `<span class="card-spec">🚗 ${im.vagas} vagas</span>` : ''}
        </div>
        <a href="detalhes.html?id=${im.id}" class="btn-primary card-btn" style="justify-content:center;">Ver Detalhes</a>
      </div>
    </div>
  `;
}