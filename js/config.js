const API = 'https://casacerta.onrender.com';

// Avisa o usuário quando o servidor estiver acordando
async function verificarServidor() {
  const aviso = document.getElementById('aviso-servidor');
  if (!aviso) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(`${API}/api`, { signal: controller.signal });
    clearTimeout(timeout);
    aviso.style.display = 'none';
  } catch {
    aviso.style.display = 'flex';
    // Tenta de novo a cada 5 segundos
    setTimeout(verificarServidor, 5000);
  }
}

document.addEventListener('DOMContentLoaded', verificarServidor);