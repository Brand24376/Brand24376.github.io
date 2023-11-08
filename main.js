import './style.css';

import * as THREE from './three.module.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer(
  { canvas: document.querySelector('#bg') },
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.y = 5;
camera.position.z = 70;

//LIGHTS
const pointLight = new THREE.PointLight(0xFFFFFF, 1000, 1000);
pointLight.position.set(0, 20, 50);

const ambientLight = new THREE.AmbientLight(0xFFFFFF);

scene.add(pointLight);
scene.add(ambientLight);

//HELPERS
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
const axesHelper = new THREE.AxesHelper(20, 20, 20);
scene.add(lightHelper);
scene.add(gridHelper);
scene.add(axesHelper);

const geoPog = new THREE.CylinderGeometry(10, 10, 1.5, 32);
const texturePog = new THREE.TextureLoader().load('vegetaUltraEgo.jpg');
const matPog = new THREE.MeshStandardMaterial(
  {
    color: 0xFFFFFF,
    wireframe: false,
    map: texturePog
  }
);
const pog = new THREE.Mesh(geoPog, matPog);
pog.rotation.x = 45;

scene.add(pog);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const star = new THREE.Mesh(geometry, material);

  const x = THREE.MathUtils.randFloatSpread(400)
  const y = THREE.MathUtils.randFloatSpread(300)
  const z = THREE.MathUtils.randFloatSpread(100)
  star.position.set(x, y - 25, z - 100);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(5, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture
  })
);

scene.add(moon);

moon.position.z = 30;
moon.position.x = -10;

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.position.y = t * -0.0002;
}

document.body.onscroll = moveCamera;

function animate(time) {
  requestAnimationFrame(animate);

  pog.rotation.x += 0.01;
  pog.rotation.y += 0.01;
  pog.rotation.z += 0.01;

  renderer.render(scene, camera);
}

animate();