import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// =========================
// Cena
// =========================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// =========================
// Câmera
// =========================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// =========================
// Renderizador
// =========================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

// =========================
// Iluminação
// =========================

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// =========================
// Controles de Câmera (CAD Viewer)
// =========================

const controls = new OrbitControls(camera, renderer.domElement);

// Adiciona suavidade (inércia) ao movimento da câmara
controls.enableDamping = true; 
controls.dampingFactor = 0.05;

// Limitar o zoom para o utilizador não atravessar a malha
controls.minDistance = 1;
controls.maxDistance = 20;
controls.zoomSpeed = 3.0;

// Permite arrastar a câmara lateralmente (Pan) com o botão direito
controls.enablePan = true;
controls.panSpeed = 3.0;

// =========================
// Modelo
// =========================

let model;

const loader = new GLTFLoader();

loader.load(
    '/models/coolobject.glb',
    (gltf) => {
        model = gltf.scene;

        // 1. Calcula o tamanho e o centro real do modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // 2. Centraliza o modelo no ponto (0,0,0)
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // 3. CORREÇÃO DO SUMIÇO: Percorre o modelo para ajustar propriedades das malhas
        model.traverse((child) => {
            if (child.isMesh) {
                // Desativa o descarte automático para o objeto não sumir ao rotacionar
                child.frustumCulled = false;
                
                // Opcional: Garante que as faces internas e externas sejam renderizadas (comum em CAD)
                child.material.side = THREE.DoubleSide;
            }
        });

        scene.add(model);

        // 4. CORREÇÃO DO CLIPPING: Ajusta a câmera e os limites do OrbitControls dinamicamente
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        
        // Calcula a distância ideal da câmera para que o objeto caiba perfeitamente na tela
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Dá uma margem de folga

        // Reposiciona a câmera e atualiza o plano de corte distante (far)
        camera.position.set(0, 0, cameraZ);
        camera.far = maxDim * 100; 
        camera.updateProjectionMatrix();

        // Reconfigura os limites do OrbitControls proporcionalmente ao tamanho do modelo
        controls.target.set(0, 0, 0);
        controls.minDistance = maxDim / 10;  // Permite chegar perto sem atravessar
        controls.maxDistance = maxDim * 10;  // Permite afastar sem sumir no infinito
        controls.update();

        console.log("Modelo carregado e enquadrado com sucesso.");
    },
    (xhr) => {
        if (xhr.total) {
            console.log(((xhr.loaded / xhr.total) * 100).toFixed(1) + "% carregado");
        }
    },
    (error) => {
        console.error("Erro ao carregar:", error);
    }
);

// =========================
// Resize
// =========================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================
// Render Loop
// =========================

function animate() {
    requestAnimationFrame(animate);

    // Atualiza a câmara a cada quadro (essencial para o damping funcionar)
    controls.update(); 

    renderer.render(scene, camera);
}

animate();