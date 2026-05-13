const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

// ===== CLOUDINARY =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'casacerta',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { files: 5, fileSize: 5 * 1024 * 1024 }
});

// ===== BANCO DE DADOS (Supabase PostgreSQL) =====
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no PostgreSQL:', err.message);
  } else {
    console.log('Conectado ao Supabase!');
    criarTabelas();
  }
});

async function criarTabelas() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      telefone VARCHAR(20),
      cpf_cnpj VARCHAR(20),
      senha VARCHAR(255)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS favoritos (
      id SERIAL PRIMARY KEY,
      usuario_id INT,
      imovel_id INT,
      UNIQUE (usuario_id, imovel_id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS simulacoes (
      id SERIAL PRIMARY KEY,
      usuario_id INT,
      valor DECIMAL(15,2),
      entrada DECIMAL(15,2),
      prazo INT,
      taxa DECIMAL(5,2),
      parcela VARCHAR(50),
      total VARCHAR(50),
      data VARCHAR(50),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS contratos (
      id SERIAL PRIMARY KEY,
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
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS imoveis_anuncios (
      id SERIAL PRIMARY KEY,
      usuario_id INT,
      nome VARCHAR(255),
      email VARCHAR(255),
      telefone VARCHAR(20),
      tipo VARCHAR(50),
      endereco VARCHAR(255),
      bairro VARCHAR(255),
      cidade VARCHAR(255),
      valor VARCHAR(50),
      finalidade VARCHAR(50),
      descricao TEXT,
      area VARCHAR(20),
      quartos INT DEFAULT 0,
      banheiros INT DEFAULT 0,
      vagas INT DEFAULT 0,
      fotos TEXT,
      status VARCHAR(30) DEFAULT 'pendente',
      data_envio VARCHAR(30),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    console.log('Tabelas criadas/verificadas!');
  } catch (err) {
    console.error('Erro ao criar tabelas:', err.message);
  }
}

// ===== USUÁRIOS =====
app.post('/usuarios', async (req, res) => {
  const { nome, email, telefone, cpf_cnpj, senha } = req.body;
  if (!nome || !email || !telefone || !cpf_cnpj || !senha)
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  try {
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, telefone, cpf_cnpj, senha) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [nome, email, telefone, cpf_cnpj, senha]
    );
    res.json({ id: result.rows[0].id, nome, email, telefone, cpf_cnpj });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ erro: 'E-mail já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await db.query('SELECT id, nome, email, telefone, cpf_cnpj FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/usuarios/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nome, email, telefone, cpf_cnpj FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.patch('/usuarios/:id', async (req, res) => {
  const { nome, telefone, cpf_cnpj } = req.body;
  try {
    await db.query(
      'UPDATE usuarios SET nome=$1, telefone=$2, cpf_cnpj=$3 WHERE id=$4',
      [nome, telefone, cpf_cnpj, req.params.id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== LOGIN USUÁRIO =====
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos' });
  try {
    const result = await db.query(
      'SELECT id, nome, email, telefone, cpf_cnpj FROM usuarios WHERE email=$1 AND senha=$2',
      [email, senha]
    );
    if (result.rows.length === 0) return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    res.json({ sucesso: true, usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
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
app.post('/recuperar', async (req, res) => {
  const { contato } = req.body;
  if (!contato) return res.status(400).json({ erro: 'Informe seu e-mail ou telefone.' });
  try {
    const result = await db.query(
      'SELECT id FROM usuarios WHERE email=$1 OR telefone=$2',
      [contato, contato]
    );
    if (result.rows.length === 0) return res.status(404).json({ erro: 'Nenhuma conta encontrada.' });
    res.json({ sucesso: true, usuario_id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.patch('/usuarios/:id/senha', async (req, res) => {
  const { senha } = req.body;
  if (!senha || senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  try {
    const result = await db.query('UPDATE usuarios SET senha=$1 WHERE id=$2', [senha, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== FAVORITOS =====
app.get('/favoritos/:usuario_id', async (req, res) => {
  try {
    const result = await db.query('SELECT imovel_id FROM favoritos WHERE usuario_id=$1', [req.params.usuario_id]);
    res.json(result.rows.map(r => r.imovel_id));
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/favoritos', async (req, res) => {
  const { usuario_id, imovel_id } = req.body;
  if (!usuario_id || !imovel_id) return res.status(400).json({ erro: 'Dados incompletos' });
  try {
    await db.query(
      'INSERT INTO favoritos (usuario_id, imovel_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [usuario_id, imovel_id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/favoritos', async (req, res) => {
  const { usuario_id, imovel_id } = req.body;
  try {
    await db.query('DELETE FROM favoritos WHERE usuario_id=$1 AND imovel_id=$2', [usuario_id, imovel_id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== SIMULAÇÕES =====
app.get('/simulacoes/:usuario_id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM simulacoes WHERE usuario_id=$1 ORDER BY id DESC', [req.params.usuario_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/simulacoes', async (req, res) => {
  const { usuario_id, valor, entrada, prazo, taxa, parcela, total, data } = req.body;
  if (!usuario_id || !valor) return res.status(400).json({ erro: 'Dados incompletos' });
  try {
    const result = await db.query(
      'INSERT INTO simulacoes (usuario_id, valor, entrada, prazo, taxa, parcela, total, data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [usuario_id, valor, entrada, prazo, taxa, parcela, total, data]
    );
    res.json({ id: result.rows[0].id, sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/simulacoes/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM simulacoes WHERE id=$1', [req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== CONTRATOS =====
app.get('/contratos/:usuario_id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contratos WHERE usuario_id=$1 ORDER BY id DESC', [req.params.usuario_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/admin/contratos', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.nome AS nome_usuario, u.email AS email_usuario
       FROM contratos c LEFT JOIN usuarios u ON c.usuario_id = u.id
       ORDER BY c.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/contratos', async (req, res) => {
  const { usuario_id, tipo, imovel, locatario, avalista, valor, data_inicio, data_fim, status } = req.body;
  if (!usuario_id || !tipo || !imovel || !locatario || !valor || !data_inicio)
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  try {
    const result = await db.query(
      'INSERT INTO contratos (usuario_id, tipo, imovel, locatario, avalista, valor, data_inicio, data_fim, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
      [usuario_id, tipo, imovel, locatario, avalista || null, valor, data_inicio, data_fim || null, status || 'ativo']
    );
    res.json({ id: result.rows[0].id, sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/contratos/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM contratos WHERE id=$1', [req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== ANÚNCIOS DE IMÓVEIS =====
app.post('/imoveis', upload.array('fotos', 5), async (req, res) => {
  const { usuario_id, nome, email, telefone, tipo, endereco, cidade, valor, finalidade, descricao } = req.body;
  if (!usuario_id || !nome || !email || !telefone || !tipo || !endereco)
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });

  const data_envio = new Date().toLocaleDateString('pt-BR');
  const fotos = req.files && req.files.length > 0
    ? JSON.stringify(req.files.map(f => f.path))
    : null;

  try {
    const result = await db.query(
      `INSERT INTO imoveis_anuncios (usuario_id, nome, email, telefone, tipo, endereco, cidade, valor, finalidade, descricao, fotos, status, data_envio)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pendente',$12) RETURNING id`,
      [usuario_id, nome, email, telefone, tipo, endereco, cidade, valor, finalidade, descricao, fotos, data_envio]
    );
    res.json({ id: result.rows[0].id, sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/admin/imoveis', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, u.nome AS nome_usuario FROM imoveis_anuncios a
       LEFT JOIN usuarios u ON a.usuario_id = u.id
       ORDER BY a.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.patch('/admin/imoveis/:id/aprovar', async (req, res) => {
  const { bairro, cidade, valor, finalidade, area, quartos, banheiros, vagas, descricao } = req.body;
  try {
    await db.query(
      `UPDATE imoveis_anuncios 
       SET status='aprovado', bairro=$1, cidade=$2, valor=$3, finalidade=$4,
           area=$5, quartos=$6, banheiros=$7, vagas=$8, descricao=$9
       WHERE id=$10`,
      [bairro, cidade, valor, finalidade, area, quartos, banheiros, vagas, descricao, req.params.id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.patch('/admin/imoveis/:id/editar', async (req, res) => {
  const { tipo, endereco, bairro, cidade, valor, finalidade, area, quartos, banheiros, vagas, descricao } = req.body;
  try {
    await db.query(
      `UPDATE imoveis_anuncios 
       SET tipo=$1, endereco=$2, bairro=$3, cidade=$4, valor=$5, finalidade=$6,
           area=$7, quartos=$8, banheiros=$9, vagas=$10, descricao=$11
       WHERE id=$12`,
      [tipo, endereco, bairro, cidade, valor, finalidade, area, quartos, banheiros, vagas, descricao, req.params.id]
    );
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.patch('/admin/imoveis/:id/rejeitar', async (req, res) => {
  try {
    await db.query(`UPDATE imoveis_anuncios SET status='rejeitado' WHERE id=$1`, [req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/imoveis/publicos', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, tipo, endereco, bairro, cidade, valor, finalidade, descricao, area, quartos, banheiros, vagas, fotos
       FROM imoveis_anuncios WHERE status='aprovado' ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/imoveis/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM imoveis_anuncios WHERE id=$1', [req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ===== ROTA DE TESTE =====
app.get('/api', (req, res) => res.send('Servidor funcionando!'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});