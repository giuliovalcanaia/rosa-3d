// ===== UTILITÁRIOS =====

function formatarDataBR(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return dia + '/' + mes + '/' + ano;
}

function calcularBodaParaData(data) {
  const anos = data.getFullYear() - DATA_INICIO.getFullYear();
  const meses = data.getMonth() - DATA_INICIO.getMonth();
  const dias = data.getDate() - DATA_INICIO.getDate();

  let totalMeses = anos * 12 + meses;
  if (dias < 0) {
    totalMeses--;
  }

  if (totalMeses <= 0) {
    return null;
  }

  if (totalMeses >= 1 && totalMeses <= 11) {
    return 'Bodas de ' + BODAS.mensais[totalMeses] + ' — mensal';
  }

  const ano = Math.floor(totalMeses / 12);
  const mesRestante = totalMeses % 12;

  if (mesRestante === 0) {
    return 'Bodas de ' + BODAS.anuais[ano] + ' — anual';
  }

  const subBoda = BODAS.subAnuais[ano] && BODAS.subAnuais[ano][mesRestante];
  if (subBoda) {
    return 'Bodas de ' + subBoda + ' — mensal';
  }

  return 'Bodas de ' + BODAS.anuais[ano] + ' — anual';
}

function calcularTempoParaData(data) {
  const anos = data.getFullYear() - DATA_INICIO.getFullYear();
  const meses = data.getMonth() - DATA_INICIO.getMonth();
  const dias = data.getDate() - DATA_INICIO.getDate();

  let totalMeses = anos * 12 + meses;
  if (dias < 0) {
    totalMeses--;
  }

  if (totalMeses <= 0) {
    return 'Juntos há 0 dias';
  }

  const anosDecorridos = Math.floor(totalMeses / 12);
  const mesesRestantes = totalMeses % 12;

  if (anosDecorridos === 0) {
    return 'Juntos há ' + totalMeses + (totalMeses === 1 ? ' mês' : ' meses');
  }

  if (mesesRestantes === 0) {
    return 'Juntos há ' + anosDecorridos + (anosDecorridos === 1 ? ' ano' : ' anos');
  }

  return 'Juntos há ' + anosDecorridos + (anosDecorridos === 1 ? ' ano' : ' anos') +
    ' e ' + mesesRestantes + (mesesRestantes === 1 ? ' mês' : ' meses');
}

function gerarDatasMesVersario() {
  const datas = [];
  let data = new Date(DATA_INICIO);
  while (data <= DATA_ATUAL) {
    datas.push(new Date(data));
    data.setMonth(data.getMonth() + 1);
  }
  return datas;
}

function montarEntradaIdenticon(dataVersario) {
  const inicioStr = DATA_INICIO.toISOString().split('T')[0];
  const dataStr = dataVersario.toISOString().split('T')[0];
  return inicioStr + '_' + dataStr;
}

// ===== NAVEGAÇÃO =====

const todasDatas = gerarDatasMesVersario();
const params = new URLSearchParams(window.location.search);
const entradaInicial = params.get('data');

if (!entradaInicial) {
  window.location.href = 'historico.html';
}

const partesEntrada = entradaInicial.split('_');
if (partesEntrada.length !== 2) {
  window.location.href = 'historico.html';
}

const dataVersarioStr = partesEntrada[1];
const [anoStr, mesStr, diaStr] = dataVersarioStr.split('-');
const dataVersarioInicial = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));

let currentIndex = todasDatas.findIndex(function (d) {
  return d.getTime() === dataVersarioInicial.getTime();
});

if (currentIndex === -1) {
  window.location.href = 'historico.html';
}

let currentEntrada = entradaInicial;

const titleEl = document.getElementById('title');
const bodaEl = document.getElementById('boda');
const tempoEl = document.getElementById('tempo');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

function updateTextPanel(data) {
  titleEl.textContent = formatarDataBR(data);
  const bodaTexto = calcularBodaParaData(data);
  bodaEl.textContent = bodaTexto || '';
  tempoEl.textContent = calcularTempoParaData(data);
}

function updateButtons() {
  if (currentIndex <= 0) {
    btnPrev.classList.add('disabled');
    btnPrev.href = '#';
  } else {
    btnPrev.classList.remove('disabled');
    const prevData = todasDatas[currentIndex - 1];
    btnPrev.href = 'rosa-identicon.html?data=' + encodeURIComponent(montarEntradaIdenticon(prevData));
  }

  if (currentIndex >= todasDatas.length - 1) {
    btnNext.classList.add('disabled');
    btnNext.href = '#';
  } else {
    btnNext.classList.remove('disabled');
    const nextData = todasDatas[currentIndex + 1];
    btnNext.href = 'rosa-identicon.html?data=' + encodeURIComponent(montarEntradaIdenticon(nextData));
  }
}

// ===== THREE.JS =====

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1A1A2E);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -3, 2);
camera.up.set(0, 0, 1);

const canvasContainer = document.getElementById('canvas-container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.touchAction = 'none';
canvasContainer.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

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

  const fold = Math.pow(u, 4);
  const shrink = 1 - 0.8 * fold;
  const rOriginal = Math.sqrt(posX * posX + posY * posY);
  const lift = rOriginal * 1 * fold;

  target.set(posX * shrink, posY * shrink, posZ * 0.4 + lift);
}

const STACKS = 30;
const SLICES = 600;
const geometryOpen = new THREE.ParametricGeometry(roseFunctionOpen, STACKS, SLICES);
const geometryClosed = new THREE.ParametricGeometry(roseFunctionClosed, STACKS, SLICES);

const geometry = geometryOpen.clone();

const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
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

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x442233, 0.7);
scene.add(hemiLight);

const dirLight2 = new THREE.DirectionalLight(0xff0044, 0.15);
dirLight2.position.set(-5, -5, -2);
scene.add(dirLight2);

const headLight = new THREE.DirectionalLight(0xffffff, 0.8);
headLight.position.set(0, 0, 1);
camera.add(headLight);

const headLightTarget = new THREE.Object3D();
headLightTarget.position.set(0, 0, -1);
camera.add(headLightTarget);
headLight.target = headLightTarget;

scene.add(camera);

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

// Controle de Abrir/Fechar
let isOpen = false;
let currentOpenness = 0;
const ANIMATION_SPEED = 0.05;

function toggleRose() {
  isOpen = !isOpen;
}

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
  if (distance < 5) {
    toggleRose();
  }
});

// Loop de Animação
const posAttr = geometry.attributes.position;
const posOpen = geometryOpen.attributes.position;
const posClosed = geometryClosed.attributes.position;
const vertexCount = posAttr.count;

function animate() {
  requestAnimationFrame(animate);
  if (!isRotationLocked) {
    roseGroup.rotation.z += 0.005;
  }

  const targetOpenness = isOpen ? 1.0 : 0.0;
  currentOpenness += (targetOpenness - currentOpenness) * ANIMATION_SPEED;

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

// ===== CARREGAMENTO DINÂMICO DA ROSA =====

function loadRosa(entrada) {
  const newTexture = gerarTexturaIdenticon(entrada, 512);
  newTexture.repeat.set(1.5, 13);

  if (material.map) {
    material.map.dispose();
  }
  material.map = newTexture;
  material.needsUpdate = true;

  const partes = entrada.split('_');
  const dataStr = partes[1];
  const [ano, mes, dia] = dataStr.split('-');
  const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));

  updateTextPanel(dataObj);
  updateButtons();
}

loadRosa(currentEntrada);

// ===== EVENT LISTENERS DOS BOTÕES =====

btnPrev.addEventListener('click', (e) => {
  if (currentIndex > 0) {
    e.preventDefault();
    currentIndex--;
    currentEntrada = montarEntradaIdenticon(todasDatas[currentIndex]);
    history.replaceState(null, '', 'rosa-identicon.html?data=' + encodeURIComponent(currentEntrada));
    loadRosa(currentEntrada);
  }
});

btnNext.addEventListener('click', (e) => {
  if (currentIndex < todasDatas.length - 1) {
    e.preventDefault();
    currentIndex++;
    currentEntrada = montarEntradaIdenticon(todasDatas[currentIndex]);
    history.replaceState(null, '', 'rosa-identicon.html?data=' + encodeURIComponent(currentEntrada));
    loadRosa(currentEntrada);
  }
});
