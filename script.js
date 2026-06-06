import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

loader.load(
	'models\objetodaora.glb',
	function (gltf) {

        const model = gltf.scene;

        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);

        scene.add(model);

    },

    function (xhr) {
        console.log(
            (xhr.loaded / xhr.total * 100) + '% carregado'
        );
    },

    function (error) {
        console.error('Error loading model: ', error);
    }
);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial({
    color: 0x00aaff
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

camera.position.set = (0, 1, 5);

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);

}

animate();