const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors());
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'casacerta'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no MySQL:', err.message);
  } else {
    console.log('Conectado ao MySQL!');
    criarTabelas();
  }
});

function criarTabelas() {
  db.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    cpf_cnpj VARCHAR(20),
    senha VARCHAR(255)
  )`, (err) => { if (err) console.error('Erro usuarios:', err.message); });

  db.query(`CREATE TABLE IF NOT EXISTS favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    imovel_id INT,
    UNIQUE KEY unico_favorito (usuario_id, imovel_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`, (err) => { if (err) console.error('Erro favoritos:', err.message); });

  db.query(`CREATE TABLE IF NOT EXISTS simulacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    valor DECIMAL(15,2),
    entrada DECIMAL(15,2),
    prazo INT,
    taxa DECIMAL(5,2),
    parcela VARCHAR(50),
    total VARCHAR(50),
    data VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`, (err) => { if (err) console.error('Erro simulacoes:', err.message); });

  db.query(`CREATE TABLE IF NOT EXISTS contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo VARCHAR(20),
    imovel VARCHAR(255),
    locatario VARCHAR(255),
    avalista VARCHAR(255),
    valor DECIMAL(15,2),
    data_inicio VARCHAR(20),
    data_fim VARCHAR(20),
    status VARCHAR(30) DEFAULT 'ativo',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`, (err) => { if (err) console.error('Erro contratos:', err.message); });

  db.query(`CREATE TABLE IF NOT EXISTS imoveis_anuncios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nome VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(20),
    tipo VARCHAR(50),
    endereco VARCHAR(255),
    cidade VARCHAR(255),
    valor VARCHAR(50),
    finalidade VARCHAR(50),
    descricao TEXT,
    status VARCHAR(30) DEFAULT 'pendente',
    data_envio VARCHAR(30),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`, (err) => { if (err) console.error('Erro imoveis_anuncios:', err.message); });
}

// ===== USUÁRIOS =====
app.post('/usuarios', (req, res) => {
  const { nome, email, telefone, cpf_cnpj, senha } = req.body;
  if (!nome || !email || !telefone || !cpf_cnpj || !senha)
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  db.query(
    'INSERT INTO usuarios (nome, email, telefone, cpf_cnpj, senha) VALUES (?, ?, ?, ?, ?)',
    [nome, email, telefone, cpf_cnpj, senha],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ erro: 'E-mail já cadastrado' });
        return res.status(500).json({ erro: err.message });
      }
      res.json({ id: result.insertId, nome, email, telefone, cpf_cnpj });
    }
  );
});

app.get('/usuarios', (req, res) => {
  db.query('SELECT id, nome, email, telefone, cpf_cnpj FROM usuarios', (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.get('/usuarios/:id', (req, res) => {
  db.query(
    'SELECT id, nome, email, telefone, cpf_cnpj FROM usuarios WHERE id = ?',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
      res.json(rows[0]);
    }
  );
});

// ===== LOGIN USUÁRIO =====
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos' });
  db.query(
    'SELECT id, nome, email, telefone, cpf_cnpj FROM usuarios WHERE email = ? AND senha = ?',
    [email, senha],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
      res.json({ sucesso: true, usuario: rows[0] });
    }
  );
});

// ===== LOGIN ADMIN =====
app.post('/admin/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'admin' && senha === 'admin123') {
    res.json({ sucesso: true });
  } else {
    res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }
});

// ===== RECUPERAÇÃO DE SENHA =====
app.post('/recuperar', (req, res) => {
  const { contato } = req.body;
  if (!contato) return res.status(400).json({ erro: 'Informe seu e-mail ou telefone.' });
  db.query(
    'SELECT id FROM usuarios WHERE email = ? OR telefone = ?',
    [contato, contato],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      if (rows.length === 0) return res.status(404).json({ erro: 'Nenhuma conta encontrada.' });
      res.json({ sucesso: true, usuario_id: rows[0].id });
    }
  );
});

app.patch('/usuarios/:id/senha', (req, res) => {
  const { senha } = req.body;
  if (!senha || senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senha, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json({ sucesso: true });
  });
});

// ===== FAVORITOS =====
app.get('/favoritos/:usuario_id', (req, res) => {
  db.query('SELECT imovel_id FROM favoritos WHERE usuario_id = ?', [req.params.usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows.map(r => r.imovel_id));
  });
});

app.post('/favoritos', (req, res) => {
  const { usuario_id, imovel_id } = req.body;
  if (!usuario_id || !imovel_id) return res.status(400).json({ erro: 'Dados incompletos' });
  db.query('INSERT IGNORE INTO favoritos (usuario_id, imovel_id) VALUES (?, ?)', [usuario_id, imovel_id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

app.delete('/favoritos', (req, res) => {
  const { usuario_id, imovel_id } = req.body;
  db.query('DELETE FROM favoritos WHERE usuario_id = ? AND imovel_id = ?', [usuario_id, imovel_id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

// ===== SIMULAÇÕES =====
app.get('/simulacoes/:usuario_id', (req, res) => {
  db.query('SELECT * FROM simulacoes WHERE usuario_id = ? ORDER BY id DESC', [req.params.usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.post('/simulacoes', (req, res) => {
  const { usuario_id, valor, entrada, prazo, taxa, parcela, total, data } = req.body;
  if (!usuario_id || !valor) return res.status(400).json({ erro: 'Dados incompletos' });
  db.query(
    'INSERT INTO simulacoes (usuario_id, valor, entrada, prazo, taxa, parcela, total, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [usuario_id, valor, entrada, prazo, taxa, parcela, total, data],
    (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: result.insertId, sucesso: true });
    }
  );
});

app.delete('/simulacoes/:id', (req, res) => {
  db.query('DELETE FROM simulacoes WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

// ===== CONTRATOS =====
app.get('/contratos/:usuario_id', (req, res) => {
  db.query('SELECT * FROM contratos WHERE usuario_id = ? ORDER BY id DESC', [req.params.usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.get('/admin/contratos', (req, res) => {
  db.query(
    `SELECT c.*, u.nome AS nome_usuario, u.email AS email_usuario
     FROM contratos c LEFT JOIN usuarios u ON c.usuario_id = u.id
     ORDER BY c.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    }
  );
});

app.post('/contratos', (req, res) => {
  const { usuario_id, tipo, imovel, locatario, avalista, valor, data_inicio, data_fim, status } = req.body;
  if (!usuario_id || !tipo || !imovel || !locatario || !valor || !data_inicio)
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  db.query(
    'INSERT INTO contratos (usuario_id, tipo, imovel, locatario, avalista, valor, data_inicio, data_fim, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [usuario_id, tipo, imovel, locatario, avalista || null, valor, data_inicio, data_fim || null, status || 'ativo'],
    (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: result.insertId, sucesso: true });
    }
  );
});

app.delete('/contratos/:id', (req, res) => {
  db.query('DELETE FROM contratos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

// ===== ANÚNCIOS DE IMÓVEIS =====

// Enviar anúncio (usuário logado)
app.post('/imoveis', (req, res) => {
  const { usuario_id, nome, email, telefone, tipo, endereco, cidade, valor, finalidade, descricao } = req.body;
  if (!usuario_id || !nome || !email || !telefone || !tipo || !endereco)
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });

  const data_envio = new Date().toLocaleDateString('pt-BR');

  db.query(
    `INSERT INTO imoveis_anuncios (usuario_id, nome, email, telefone, tipo, endereco, cidade, valor, finalidade, descricao, status, data_envio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)`,
    [usuario_id, nome, email, telefone, tipo, endereco, cidade, valor, finalidade, descricao, data_envio],
    (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: result.insertId, sucesso: true });
    }
  );
});

// Listar todos os anúncios (admin)
app.get('/admin/imoveis', (req, res) => {
  db.query(
    `SELECT a.*, u.nome AS nome_usuario FROM imoveis_anuncios a
     LEFT JOIN usuarios u ON a.usuario_id = u.id
     ORDER BY a.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows);
    }
  );
});

// ROTA PARA LISTAGEM PÚBLICA (Página de Imóveis)
app.get('/imoveis/publicos', (req, res) => {
  const sql = `
    SELECT id, tipo, endereco, cidade, valor, finalidade, descricao 
    FROM imoveis_anuncios 
    WHERE status = 'pendente' 
    ORDER BY id DESC`;
  // Dica: use status = 'aprovado' se quiser que o admin filtre antes

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// Excluir anúncio (admin)
app.delete('/imoveis/:id', (req, res) => {
  db.query('DELETE FROM imoveis_anuncios WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

// ===== ROTA DE TESTE =====
app.get('/api', (req, res) => {
  res.send('Servidor funcionando!');
});

// Rota raiz → abre index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});