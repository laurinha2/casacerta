// migrar-senhas.js
// Execute ANTES de subir o novo server.js:
//   node migrar-senhas.js
//
// Esse script lê todos os usuários, verifica se a senha já é um hash bcrypt,
// e faz o hash apenas das que ainda estão em texto puro.

require('dotenv').config(); // lê o .env se existir
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
 ssl: false
});

async function migrarSenhas() {
  console.log('🔄 Iniciando migração de senhas...\n');

  const { rows: usuarios } = await db.query('SELECT id, nome, email, senha FROM usuarios');

  if (usuarios.length === 0) {
    console.log('Nenhum usuário encontrado.');
    await db.end();
    return;
  }

  let migrados = 0;
  let pulados = 0;

  for (const usuario of usuarios) {
    const jaEhHash = usuario.senha && usuario.senha.startsWith('$2b$');

    if (jaEhHash) {
      console.log(`⏭  [${usuario.id}] ${usuario.email} — já é hash, pulando.`);
      pulados++;
      continue;
    }

    const hashSenha = await bcrypt.hash(usuario.senha, 10);
    await db.query('UPDATE usuarios SET senha=$1 WHERE id=$2', [hashSenha, usuario.id]);
    console.log(`✅ [${usuario.id}] ${usuario.email} — senha migrada.`);
    migrados++;
  }

  console.log(`\n✔ Migração concluída: ${migrados} migradas, ${pulados} já eram hash.`);
  await db.end();
}

migrarSenhas().catch(err => {
  console.error('❌ Erro na migração:', err.message);
  db.end();
});