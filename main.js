import * as THREE from 'three';

// Starting position of the images from the top
const STARTY = 0;

// Create a new scene
const scene = new THREE.Scene();

// Create and position the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = STARTY;
camera.position.z = 30;

// Create list of images in the 'img' folder
let imgList = [
    'photoOfMe.png',
    'comptiaITF+Certification.png',
    'OSHACertificate.png',
    'UI_ShopCodeScreenshot.png',
    'itemScriptCodeScreenshot.png',
    'oreRandomizationSystemCodeScreenshot.png',
    'ytecheduPhoto.png',
    'yorkTechHonorRolls.png',
    'oreMiningCodeScreenshot.png',
    'myGithub.png',
    'esportsIcon.png'
];

// Add every listed image as a plane mesh with texture to scene
for (const image in imgList) {
    // Every mesh has a geometry, texture, and material
    // if else statement used if certain images require a different aspect ratio
    if (image == 0) {
        var geometry = new THREE.PlaneGeometry(20, 20);
    }
    if (image == 3) {
        var geometry = new THREE.PlaneGeometry(30, 20);
    }
    if (image == 4) {
        var geometry = new THREE.PlaneGeometry(20, 20);
    }
    if (image == 5) {
        var geometry = new THREE.PlaneGeometry(20, 20);
    }
    if (image == 8) {
        var geometry = new THREE.PlaneGeometry(30, 20);
    }
    if (image == 9) {
        var geometry = new THREE.PlaneGeometry(30, 20);
    }
    if (image == 10) {
        var geometry = new THREE.PlaneGeometry(15, 15);
    }
    if (image != 0 && image != 3 && image != 4 && image != 5 && image != 8 && image != 9 && image != 10) {
        var geometry = new THREE.PlaneGeometry(20, 13.33);
    }
    const texture = new THREE.TextureLoader().load('img/' + imgList[image]);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: texture // Add the texture image here
    });
    const plane = new THREE.Mesh(geometry, material);

    // Add the new plane to the scene
    scene.add(plane);
};

const background = new THREE.TextureLoader().load('img/background.png');
scene.background = background;

// Move the camera with the scroll bar
function moveCamera() {
    const top = document.body.getBoundingClientRect().top;
    camera.position.y = STARTY + top * 0.07;
};

// Add the scrollbar event to move camera
document.body.onscroll = moveCamera;

// Resize the threejs canvas with the window and adjust for phone sizes
function resizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Adjust for phone or desktop size
    if (window.innerWidth <= 600) {
        camera.position.x = 0;
        for (const child in scene.children) {
            scene.children[child].rotation.y = 0;
            scene.children[child].position.y = child * -50;
        };
    } else {
        camera.position.x = 15;
        for (const child in scene.children) {
            scene.children[child].rotation.y = 15 * (Math.PI / 180);
            scene.children[child].position.y = child * -30;
            if (child == 1) {
                scene.children[1].position.y = -93;
                scene.children[1].position.x = -15.5;
            }
            if (child == 2) {
                scene.children[2].rotation.y = -15 * (Math.PI / 180);
                scene.children[2].position.y = -93;
                scene.children[2].position.x = 4;
            }
            if (child == 3) {
                scene.children[3].position.y = -27;
                scene.children[3].position.x = -1;
            }
            if (child == 4) {
                scene.children[4].position.y = -48;
                scene.children[4].position.x = -15.5;
            }
            if (child == 5) {
                scene.children[5].rotation.y = -15 * (Math.PI / 180);
                scene.children[5].position.y = -48;
                scene.children[5].position.x = 4;
            }
            if (child == 6) {
                scene.children[6].position.y = -110;
                scene.children[6].position.x = -15.5;
            }
            if (child == 7) {
                scene.children[7].rotation.y = -15 * (Math.PI / 180);
                scene.children[7].position.y = -110;
                scene.children[7].position.x = 4;
            }
            if (child == 8) {
                scene.children[8].position.y = -70;
                scene.children[8].position.x = -1;
            }
            if (child == 9) {
                scene.children[9].position.y = -135;
                scene.children[9].position.x = -1;
            }
            if (child == 10) {
                scene.children[10].position.y = -157;
                scene.children[10].position.x = -1;
            }
        };
    };
};

// Resize canvas on window resize
window.addEventListener('resize', resizeWindow, false);

// Create the renderer and attach to the canvas
const renderer = new THREE.WebGLRenderer(
    { canvas: document.querySelector('#bg') }
);

// Set intital cavnas size
resizeWindow();

// Set renderer size and add it to the page
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Animation loop (calls itself recursively)
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

// Start the animation
animate();