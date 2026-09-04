// Lê o parâmetro 'data' da URL
const params = new URLSearchParams(window.location.search);
const entrada = params.get('data');

if (!entrada) {
  window.location.href = 'historico.html';
}

// Extrai a data do mês-versário da entrada (formato: YYYY-MM-DD_YYYY-MM-DD)
const partes = entrada.split('_');
if (partes.length !== 2) {
  window.location.href = 'historico.html';
}

const dataVersarioStr = partes[1];
const [anoStr, mesStr, diaStr] = dataVersarioStr.split('-');
const dataVersario = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));

// Formata data para exibição
function formatarDataBR(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return dia + '/' + mes + '/' + ano;
}

// Calcula boda para uma data específica
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

  // 1 a 11 meses: bodas mensais
  if (totalMeses >= 1 && totalMeses <= 11) {
    return 'Bodas de ' + BODAS.mensais[totalMeses] + ' — mensal';
  }

  // A partir de 12 meses
  const ano = Math.floor(totalMeses / 12);
  const mesRestante = totalMeses % 12;

  // Ano redondo
  if (mesRestante === 0) {
    return 'Bodas de ' + BODAS.anuais[ano] + ' — anual';
  }

  // Ano + meses
  const subBoda = BODAS.subAnuais[ano] && BODAS.subAnuais[ano][mesRestante];
  if (subBoda) {
    return 'Bodas de ' + subBoda + ' — mensal';
  }

  return 'Bodas de ' + BODAS.anuais[ano] + ' — anual';
}

// Preenche o painel de texto
const titleEl = document.getElementById('title');
const bodaEl = document.getElementById('boda');

titleEl.textContent = formatarDataBR(dataVersario);

const bodaTexto = calcularBodaParaData(dataVersario);
if (bodaTexto) {
  bodaEl.textContent = bodaTexto;
}

// 1. Cena, Câmera e Renderizador
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

  const fold = Math.pow(u, 4);
  const shrink = 1 - 0.8 * fold;
  const rOriginal = Math.sqrt(posX * posX + posY * posY);
  const lift = rOriginal * 1 * fold;

  target.set(posX * shrink, posY * shrink, posZ * 0.4 + lift);
}

// 3. Geometrias Aberta e Fechada
const STACKS = 30;
const SLICES = 600;
const geometryOpen = new THREE.ParametricGeometry(roseFunctionOpen, STACKS, SLICES);
const geometryClosed = new THREE.ParametricGeometry(roseFunctionClosed, STACKS, SLICES);

const geometry = geometryOpen.clone();

// Material com identicon da data selecionada
const identiconTexture = gerarTexturaIdenticon(entrada, 512);
identiconTexture.repeat.set(1.5, 13);

const material = new THREE.MeshStandardMaterial({
  map: identiconTexture,
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

// 4. Iluminação
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
let currentOpenness = 0;
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
