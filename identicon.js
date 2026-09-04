// identicon.js
// Gera identicon procedural via Jdenticon + cor de fundo determinística (HSV)

/**
 * Hash FNV-1a para strings.
 * Retorna um inteiro positivo.
 */
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Converte HSV (H em graus 0-360, S 0-1, V 0-1) para hex numérico (ex: 0xff00aa).
 */
function hsvToHex(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);

  return (ri << 16) | (gi << 8) | bi;
}

/**
 * Gera uma cor de fundo determinística a partir de uma string.
 * Usa HSV com S=1.0, V=0.9 e H vindo do hash.
 */
function corFundoIdenticon(entrada) {
  const hash = hashString(entrada);
  const h = hash % 360;
  return hsvToHex(h, 1.0, 0.9);
}

/**
 * Cria um canvas 2D com identicon renderizado pelo Jdenticon.
 * O fundo é preenchido com uma cor determinística gerada por hash HSV.
 *
 * @param {string} entrada - String usada como semente (ex: "2025-09-07_2026-09-03")
 * @param {number} tamanho - Tamanho do canvas (padrão 512)
 * @returns {HTMLCanvasElement}
 */
function criarCanvasIdenticon(entrada, tamanho = 1024) {
  // 1. Canvas final com fundo colorido
  const canvasFinal = document.createElement('canvas');
  canvasFinal.width = tamanho;
  canvasFinal.height = tamanho;
  const ctxFinal = canvasFinal.getContext('2d');

  // Cor de fundo determinística
  const corFundo = corFundoIdenticon(entrada);
  const hexStr = '#' + corFundo.toString(16).padStart(6, '0');

  ctxFinal.fillStyle = hexStr;
  ctxFinal.fillRect(0, 0, tamanho, tamanho);

  // 2. Canvas offscreen para o Jdenticon (evita que ele limpe nosso fundo)
  if (typeof jdenticon !== 'undefined') {
    const canvasIcon = document.createElement('canvas');
    canvasIcon.width = tamanho;
    canvasIcon.height = tamanho;
    const ctxIcon = canvasIcon.getContext('2d');

    jdenticon.drawIcon(ctxIcon, entrada, tamanho);

    // Compõe o identicon por cima do fundo colorido
    ctxFinal.drawImage(canvasIcon, 0, 0);
  } else {
    console.warn('Jdenticon não está carregado. Desenhando fallback.');
    ctxFinal.fillStyle = '#ffffff';
    ctxFinal.font = 'bold ' + (tamanho / 4) + 'px sans-serif';
    ctxFinal.textAlign = 'center';
    ctxFinal.textBaseline = 'middle';
    ctxFinal.fillText('?', tamanho / 2, tamanho / 2);
  }

  return canvasFinal;
}

/**
 * Gera uma THREE.CanvasTexture com identicon procedural.
 *
 * @param {string} entrada - String semente
 * @param {number} tamanho - Resolução da textura (padrão 512)
 * @returns {THREE.CanvasTexture}
 */
function gerarTexturaIdenticon(entrada, tamanho = 512) {
  const canvas = criarCanvasIdenticon(entrada, tamanho);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Repeat será ajustado externamente conforme a necessidade da rosa
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Monta a string de entrada padrão do projeto:
 * DATA_INICIO (de config.js) + data atual no formato ISO (somente data).
 */
function getEntradaIdenticon() {
  const dataAtualStr = DATA_ATUAL.toISOString().split('T')[0]; // "YYYY-MM-DD"
  // DATA_INICIO é global, vinda de config.js
  const inicioStr = DATA_INICIO.toISOString().split('T')[0];
  return `${inicioStr}_${dataAtualStr}`;
}

/**
 * Gera e dispara o download do identicon do dia como PNG.
 */
function baixarIdenticon() {
  const entrada = getEntradaIdenticon();
  const canvas = criarCanvasIdenticon(entrada, 512);

  const link = document.createElement('a');
  link.download = `identicon-${entrada}.png`;
  link.href = canvas.toDataURL('image/png');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
