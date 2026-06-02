// ===== MÁSCARAS DE CAMPOS - CASA CERTA IMOBILIÁRIA =====

// ---- FUNÇÕES BASE ----

function mascaraCPF(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
}

function mascaraCNPJ(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  return v;
}
function mascaraCPFouCNPJ(v) {
  v = v.replace(/\D/g, '');
  v = v.substring(0, 14);
  if (v.length <= 11) return mascaraCPF(v);
  return mascaraCNPJ(v);
}

function mascaraTelefone(v) {
  v = v.replace(/\D/g, '');
  v = v.substring(0, 11);
  if (v.length <= 10) {
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return v;
}


function mascaraMoeda(v) {
  v = v.replace(/\D/g, '');
  v = (parseInt(v) / 100).toFixed(2);
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return 'R$ ' + v;
}

function mascaraCEP(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  return v;
}

// ---- APLICAR MÁSCARA EM CAMPO ----

function aplicarMascara(campo, tipo) {
  if (!campo) return;
  campo.addEventListener('input', function () {
    let v = this.value;
    if (tipo === 'cpfcnpj') this.value = mascaraCPFouCNPJ(v);
    if (tipo === 'cpf') this.value = mascaraCPF(v);
    if (tipo === 'cnpj') this.value = mascaraCNPJ(v);
    if (tipo === 'telefone') this.value = mascaraTelefone(v);
    if (tipo === 'moeda') this.value = mascaraMoeda(v);
    if (tipo === 'cep') this.value = mascaraCEP(v);
  });
}

// ---- APLICAR EM TODOS OS CAMPOS DA PÁGINA ----

document.addEventListener('DOMContentLoaded', () => {

  // CPF ou CNPJ
  aplicarMascara(document.getElementById('cad-cpf'), 'cpfcnpj');
  aplicarMascara(document.getElementById('edit-cpf'), 'cpfcnpj');

  // Telefone
  aplicarMascara(document.getElementById('cad-tel'), 'telefone');
  aplicarMascara(document.getElementById('edit-tel'), 'telefone');
  aplicarMascara(document.getElementById('an-tel'), 'telefone');
  aplicarMascara(document.getElementById('rec-contato'), 'telefone');

  // Moeda
  aplicarMascara(document.getElementById('an-valor'), 'moeda');
  aplicarMascara(document.getElementById('fin-valor'), 'moeda');
  aplicarMascara(document.getElementById('fin-entrada'), 'moeda');

  // Placeholders informativos
  const placeholders = {
    'cad-cpf': 'CPF ou CNPJ',
    'cad-tel': '(00) 00000-0000',
    'edit-cpf': 'CPF ou CNPJ',
    'edit-tel': '(00) 00000-0000',
    'an-tel': '(00) 00000-0000',
    'an-valor': 'R$ 0,00',
  };
  Object.entries(placeholders).forEach(([id, ph]) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = ph;
  });

});

// ---- VALIDAÇÕES ----

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(cpf[10]);
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefone(tel) {
  return tel.replace(/\D/g, '').length >= 10;
}

function validarSenha(senha) {
  return senha.length >= 6;
}