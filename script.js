// Função para calcular tempo de relacionamento
function calcularTempoJuntos() {
  const agora = new Date();

  let anos = agora.getFullYear() - DATA_INICIO.getFullYear();
  let meses = agora.getMonth() - DATA_INICIO.getMonth();
  let dias = agora.getDate() - DATA_INICIO.getDate();

  // Ajusta se o dia atual for menor que o dia de início
  if (dias < 0) {
    meses--;
    // Calcula dias do mês anterior
    const mesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    dias += mesAnterior.getDate();
  }

  // Ajusta se os meses ficarem negativos
  if (meses < 0) {
    anos--;
    meses += 12;
  }

  // Monta as partes do texto
  const partes = [];
  if (anos > 0) {
    partes.push(anos + (anos === 1 ? ' ano' : ' anos'));
  }
  if (meses > 0) {
    partes.push(meses + (meses === 1 ? ' mês' : ' meses'));
  }
  if (dias > 0) {
    partes.push(dias + (dias === 1 ? ' dia' : ' dias'));
  }

  // Caso especial: se for exatamente o dia de início (0 anos, 0 meses, 0 dias)
  if (partes.length === 0) {
    return 'Juntos há 0 dias';
  }

  // Junta as partes com vírgulas e "e" na última
  if (partes.length === 1) {
    return 'Juntos há ' + partes[0];
  } else if (partes.length === 2) {
    return 'Juntos há ' + partes.join(' e ');
  } else {
    return 'Juntos há ' + partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1];
  }
}

function calcularContadorRegressivo() {
  const agora = new Date();

  // Encontrar o próximo dia do aniversário/mês-versário
  let proximoMarco = new Date(agora.getFullYear(), agora.getMonth(), DATA_INICIO.getDate());

  // Se hoje já passou do dia do aniversário, ou é exatamente o dia, o próximo marco é no próximo mês
  if (agora.getDate() >= DATA_INICIO.getDate()) {
    proximoMarco.setMonth(proximoMarco.getMonth() + 1);
  }

  // Calcular dias restantes
  const umDia = 24 * 60 * 60 * 1000;
  const diasRestantes = Math.ceil((proximoMarco - agora) / umDia);

  // Calcular quantos meses se passaram desde o início até o próximo marco
  const mesesDecorridos = (proximoMarco.getFullYear() - DATA_INICIO.getFullYear()) * 12 + (proximoMarco.getMonth() - DATA_INICIO.getMonth());

  // Determinar se é aniversário ou mês-versário
  let textoMarco;
  if (mesesDecorridos % 12 === 0) {
    const anos = mesesDecorridos / 12;
    textoMarco = anos === 1 ? 'aniversário de 1 ano' : 'aniversário de ' + anos + ' anos';
  } else {
    const anos = Math.floor(mesesDecorridos / 12);
    const meses = mesesDecorridos % 12;

    if (anos === 0) {
      textoMarco = meses === 1 ? 'mês-versário de 1 mês' : 'mês-versário de ' + meses + ' meses';
    } else {
      const textoAnos = anos === 1 ? '1 ano' : anos + ' anos';
      const textoMeses = meses === 1 ? '1 mês' : meses + ' meses';
      textoMarco = 'mês-versário de ' + textoAnos + ' e ' + textoMeses;
    }
  }

  return 'Faltam ' + diasRestantes + (diasRestantes === 1 ? ' dia ' : ' dias ') + 'para o ' + textoMarco + ' de namoro';
}

// Função auxiliar para calcular anos, meses e total de meses decorridos
function calcularDadosTempo() {
  const agora = new Date();
  let anos = agora.getFullYear() - DATA_INICIO.getFullYear();
  let meses = agora.getMonth() - DATA_INICIO.getMonth();
  let dias = agora.getDate() - DATA_INICIO.getDate();

  if (dias < 0) {
    meses--;
    const mesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    dias += mesAnterior.getDate();
  }

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  const totalMeses = anos * 12 + meses;
  return { anos, meses, dias, totalMeses };
}

// Função para determinar o nome da boda atual
function calcularBoda() {
  const { totalMeses } = calcularDadosTempo();

  if (totalMeses <= 0) {
    return { principal: null, tipoPrincipal: null, alternativa: null, tipoAlternativa: null, clicavel: false };
  }

  // 1 a 11 meses: bodas mensais
  if (totalMeses >= 1 && totalMeses <= 11) {
    return {
      principal: 'Bodas de ' + BODAS.mensais[totalMeses],
      tipoPrincipal: 'mensal',
      alternativa: null,
      tipoAlternativa: null,
      clicavel: false
    };
  }

  // A partir de 12 meses
  const ano = Math.floor(totalMeses / 12);
  const mesRestante = totalMeses % 12;

  // Ano redondo (ex: 12, 24, 36 meses)
  if (mesRestante === 0) {
    return {
      principal: 'Bodas de ' + BODAS.anuais[ano],
      tipoPrincipal: 'anual',
      alternativa: null,
      tipoAlternativa: null,
      clicavel: false
    };
  }

  // Ano + meses (ex: 13 meses = 1 ano + 1 mês)
  const subBoda = BODAS.subAnuais[ano] && BODAS.subAnuais[ano][mesRestante];
  if (subBoda) {
    return {
      principal: 'Bodas de ' + subBoda,
      tipoPrincipal: 'mensal',
      alternativa: 'Bodas de ' + BODAS.anuais[ano],
      tipoAlternativa: 'anual',
      clicavel: true
    };
  }

  // Fallback: se não houver sub-boda cadastrada
  return {
    principal: 'Bodas de ' + BODAS.anuais[ano],
    tipoPrincipal: 'anual',
    alternativa: null,
    tipoAlternativa: null,
    clicavel: false
  };
}

// Atualiza o título, countdown e boda
const titleEl = document.getElementById('title');
const countdownEl = document.getElementById('countdown');

const textoTempo = calcularTempoJuntos();
countdownEl.textContent = calcularContadorRegressivo();

const bodaInfo = calcularBoda();
let estadoCiclo = 0; // 0 = tempo, 1 = mensal, 2 = anual

function renderTitle() {
  if (estadoCiclo === 0 || !bodaInfo.principal) {
    titleEl.textContent = textoTempo;
    return;
  }

  if (estadoCiclo === 1) {
    titleEl.textContent = bodaInfo.principal + ' — ' + bodaInfo.tipoPrincipal;
    return;
  }

  if (estadoCiclo === 2 && bodaInfo.alternativa) {
    titleEl.textContent = bodaInfo.alternativa + ' — ' + bodaInfo.tipoAlternativa;
    return;
  }

  // Se estado 2 não tem alternativa, volta para tempo
  estadoCiclo = 0;
  titleEl.textContent = textoTempo;
}

renderTitle();

// Adiciona classe de toggle se tiver bodas para mostrar
if (bodaInfo.principal) {
  titleEl.classList.add('title-toggle');
}

titleEl.addEventListener('click', (e) => {
  e.stopPropagation();

  if (!bodaInfo.principal) return;

  // Avança o estado ciclicamente
  estadoCiclo++;

  // Se não tem alternativa, pula o estado 2
  if (estadoCiclo === 2 && !bodaInfo.alternativa) {
    estadoCiclo = 0;
  }

  // Se passou do 2, volta para 0
  if (estadoCiclo > 2) {
    estadoCiclo = 0;
  }

  renderTitle();
});

// Abre o post original ao clicar na fórmula
document.getElementById('formula').addEventListener('click', () => {
  window.open('https://nylander.wordpress.com/2006/06/21/rose-shaped-parametric-surface/', '_blank');
});

// Função hash para gerar cor diária baseada na data
function getDailyHSVColor() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let h = Math.abs(hash) % 360;

  // Evita a faixa de vermelho (330° a 30°): se cair perto da cor padrão,
  // usa o inverso (complementar de 180° no círculo cromático)
  const isVermelho = (h >= 330 || h <= 30);
  if (isVermelho) {
    h = (h + 180) % 360;
  }

  const s = 1.0;
  const v = 0.9;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else if (h >= 300 && h < 360) {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  const hexNum = parseInt('0x' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join(''), 16);

  return {
    date: dateStr,
    hue: `${h}°`,
    hex: hexNum
  };
}

// Verifica se hoje é o dia do mês-versário ou aniversário
function isDiaDoMarco() {
  const today = new Date();
  return today.getDate() === DATA_INICIO.getDate();
}

// 1. Cena, Câmera e Renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1A1A2E);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -3, 2);
camera.up.set(0, 0, 1); // Orientação Z para cima

const canvasContainer = document.getElementById('canvas-container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.touchAction = 'none';
canvasContainer.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// 2. Função Paramétrica baseada na fórmula do Paul Nylander
function roseFunctionOpen(u, v, target) {
  const x = u;
  const theta = -2.222 * Math.PI + v * (18.333 * Math.PI);
  const phi = (Math.PI / 2) * Math.exp(-theta / (8 * Math.PI));
  let mod = (3.6 * theta) % (2 * Math.PI);
  if (mod < 0) mod += 2 * Math.PI;
  const X = 1 - 0.5 * Math.pow(1.25 * Math.pow(1 - mod / Math.PI, 2) - 0.25, 2);
  const y = 1.95653 * Math.pow(x, 2) * Math.pow(1.27689 * x - 1, 2) * Math.sin(phi);
  const r = X * (x * Math.sin(phi) + y * Math.cos(phi));
  const posX = r * Math.sin(theta);
  const posY = r * Math.cos(theta);
  const posZ = X * (x * Math.cos(phi) - y * Math.sin(phi));
  target.set(posX, posY, posZ);
}

function roseFunctionClosed(u, v, target) {
  const x = u;
  const theta = -2.222 * Math.PI + v * (17 * Math.PI);
  const phi = (Math.PI / 2) * Math.exp(-theta / (8 * Math.PI));
  let mod = (3.6 * theta) % (2 * Math.PI);
  if (mod < 0) mod += 2 * Math.PI;
  const X = 1 - 0.5 * Math.pow(1.25 * Math.pow(1 - mod / Math.PI, 2) - 0.25, 2);
  const y = 1.95653 * Math.pow(x, 2) * Math.pow(1.27689 * x - 1, 2) * Math.sin(phi);
  const r = X * (x * Math.sin(phi) + y * Math.cos(phi));
  const posX = r * Math.sin(theta);
  const posY = r * Math.cos(theta);
  const posZ = X * (x * Math.cos(phi) - y * Math.sin(phi));

  // Fator de dobra: 0 no centro, 1 na borda, com curva suave
  const fold = Math.pow(u, 4);

  // Puxa a borda para o centro (reduz raio XY)
  const shrink = 1 - 0.8 * fold;

  // Eleva a borda para simular enrolamento para cima (proporcional ao raio original)
  const rOriginal = Math.sqrt(posX * posX + posY * posY);
  const lift = rOriginal * 1 * fold;

  target.set(posX * shrink, posY * shrink, posZ * 0.4 + lift);
}

// 3. Geometrias Aberta e Fechada
const STACKS = 30;
const SLICES = 600;
const geometryOpen = new THREE.ParametricGeometry(roseFunctionOpen, STACKS, SLICES);
const geometryClosed = new THREE.ParametricGeometry(roseFunctionClosed, STACKS, SLICES);

// Geometria ativa: interpolamos seus vértices a cada frame
const geometry = geometryOpen.clone();

// MeshStandardMaterial (PBR) em vez de Phong: roughness alto e metalness 0
// dão um acabamento fosco/aveludado, sem o reflexo pontual "plástico"
// No dia do mês-versário/aniversário, usa cor única gerada por hash da data
const corPadrao = 0xe60033;
const corDoDia = isDiaDoMarco() ? getDailyHSVColor().hex : corPadrao;

const material = new THREE.MeshStandardMaterial({
  color: corDoDia,
  side: THREE.DoubleSide,
  roughness: 0.85,
  metalness: 0.0
});

const roseMesh = new THREE.Mesh(geometry, material);

const wireMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
  transparent: true,
  opacity: 0.15
});
const wireMesh = new THREE.Mesh(geometry, wireMaterial);

const roseGroup = new THREE.Group();
roseGroup.add(roseMesh);
roseGroup.add(wireMesh);
scene.add(roseGroup);

// 4. Iluminação
// Luz hemisférica: substitui a ambiente plana por um preenchimento suave
// com um leve gradiente entre "céu" e "chão", só para nunca ter preto puro.
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x442233, 0.7);
scene.add(hemiLight);

// Luz de contorno (rim light) bem fraca, fixa no mundo, só para dar
// uma pontinha de contraste/cor na silhueta — não deve competir com o headlight.
const dirLight2 = new THREE.DirectionalLight(0xff0044, 0.15);
dirLight2.position.set(-5, -5, -2);
scene.add(dirLight2);

// Headlight: luz principal presa à câmera, sempre apontando para onde
// a câmera está olhando (como uma lanterna de capacete). Como ela acompanha
// o ponto de vista, o lado que você está vendo está sempre bem iluminado
// e o "lado de trás" nunca aparece escuro, porque você nunca o vê mesmo.
const headLight = new THREE.DirectionalLight(0xffffff, 0.8);
headLight.position.set(0, 0, 1);   // um pouco atrás da câmera
camera.add(headLight);

const headLightTarget = new THREE.Object3D();
headLightTarget.position.set(0, 0, -1); // à frente da câmera (direção do olhar)
camera.add(headLightTarget);
headLight.target = headLightTarget;

scene.add(camera); // necessário para as luzes filhas da câmera serem renderizadas

// Ajuste ao redimensionar a janela
function updateCameraFOV() {
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;
  const aspect = w / h;
  camera.fov = aspect < 1 ? 65 : 45;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
}
updateCameraFOV();

window.addEventListener('resize', () => {
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;
  updateCameraFOV();
  renderer.setSize(w, h);
});

// 5. Controle de Abrir/Fechar
let isOpen = false;
let currentOpenness = 0; // 1 = aberta, 0 = fechada
const ANIMATION_SPEED = 0.05;

function toggleRose() {
  isOpen = !isOpen;
}

// Detecta clique seco (sem arrasto) para alternar aberto/fechado
// e clique e segure para travar/destravar o giro
let isPointerDown = false;
let pointerDownX = 0;
let pointerDownY = 0;
let isRotationLocked = false;
let pointerHoldTimeout = null;
let didHold = false;

renderer.domElement.addEventListener('pointerdown', (e) => {
  isPointerDown = true;
  didHold = false;
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;

  pointerHoldTimeout = setTimeout(() => {
    isRotationLocked = true;
    didHold = true;
  }, 400);
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (!isPointerDown) return;
  isPointerDown = false;

  clearTimeout(pointerHoldTimeout);

  if (didHold) {
    isRotationLocked = false;
    didHold = false;
    return;
  }

  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // Se moveu menos de 5 pixels, considera um clique seco
  if (distance < 5) {
    toggleRose();
  }
});

// 6. Loop de Animação
const posAttr = geometry.attributes.position;
const posOpen = geometryOpen.attributes.position;
const posClosed = geometryClosed.attributes.position;
const vertexCount = posAttr.count;

function animate() {
  requestAnimationFrame(animate);
  if (!isRotationLocked) {
    roseGroup.rotation.z += 0.005; // Rotação suave contínua
  }

  // Animação suave de abertura/fechamento
  const targetOpenness = isOpen ? 1.0 : 0.0;
  currentOpenness += (targetOpenness - currentOpenness) * ANIMATION_SPEED;

  // Interpola cada vértice entre fechado e aberto
  const closedArr = posClosed.array;
  const openArr = posOpen.array;
  const currentArr = posAttr.array;
  const t = currentOpenness;

  for (let i = 0; i < vertexCount * 3; i++) {
    currentArr[i] = closedArr[i] + (openArr[i] - closedArr[i]) * t;
  }
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  controls.update();
  renderer.render(scene, camera);
}

animate();
