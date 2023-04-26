import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

// Loaders
let sceneReady = false;
const loadingBarElement = document.querySelector('.loading-bar')
const loadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            loadingBarElement.classList.add('ended');
            loadingBarElement.style.transform = '';
        }, 500);

        //* longer timeout for html elements to show
        window.setTimeout(() => {
            sceneReady = true;
        }, 2000);
    },

    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBarElement.style.transform = `scaleX(${progressRatio})`;
    }
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

// Debug
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Overlay
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

// Update All Materials
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // child.material.envMap = environmentMap;
            child.material.envMapIntensity = debugObject.envMapIntensity;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        };
    });
};

// Environment Map
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
]);

environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

debugObject.envMapIntensity = 2.5;

// Models
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(2.5, 2.5, 2.5);
        gltf.scene.rotation.y = Math.PI * 0.5;
        scene.add(gltf.scene);

        updateAllMaterials();
    }
);

// Points of Interest
//* points array containing object for each point - { position, DOMelement }
//* position - position in scene
//* element - DOM element to select
const points = [
    {
        position: new THREE.Vector3(1.55, 0.1, -0.6),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.5, 0.8, -1.6),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(1.6, -1.3, -0.7),
        element: document.querySelector('.point-2')
    }
];
//* create raycaster
const raycaster = new THREE.Raycaster();

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, - 2.25);
scene.add(directionalLight);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 1, - 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const tick = () => {
    controls.update();

    // HTML Animation
    if (sceneReady) {
        //* loop through points array
        for (const point of points) {
            //* clone point position to avoid modifying original point
            const screenPosition = point.position.clone();
            //* project this vector from scene space into camera's normalized device coordinate (NDC)
            //* https://threejs.org/docs/#api/en/math/Vector3.project
            //* projects html element to correct position using vec3 position property in points array
            screenPosition.project(camera);

            //* https://threejs.org/docs/#api/en/core/Raycaster.setFromCamera
            //* setFromCamera(vec2, camera) can take a vec3 but will only use first 2 coordinates
            raycaster.setFromCamera(screenPosition, camera);

            //* currently testing on every object, not good for performance
            //* raycaster.intersectObjects(array, children of children, recursively:bool)
            const intersects = raycaster.intersectObjects(scene.children, true);

            //* if intersects array is empty, no object is in front of html element
            if (!intersects.length) {
                point.element.classList.add('visible');
            } else {
                //* grab intersect distance from camera
                const intersectDistance = intersects[0].distance;
                //* position:vec3.distanceTo(position:vec3) calculates distance from one vec3 to another vec3
                //* grab point distance from camera
                const pointDistance = point.position.distanceTo(camera.position);

                //* if raycaster intersect distance is less than point distance
                if (intersectDistance < pointDistance) {
                    //* remove html element visibility
                    point.element.classList.remove('visible');
                } else {
                    //* otherwise, show html element
                    point.element.classList.add('visible');
                };
            };
            //* use normalized coordinates to track movement
            const translateX = screenPosition.x * sizes.width / 2;
            const translateY = - screenPosition.y * sizes.height / 2;
            //* apply translate on movement x and y
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        };
    };

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();