import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Stats from 'stats.js';

// Performance Monitor
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Textures
const textureLoader = new THREE.TextureLoader();
const displacementTexture = textureLoader.load('/textures/displacementMap.png');

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
camera.position.set(2, 2, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: 'high-performance',
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// Test Meshes
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(- 5, 0, 0);
scene.add(cube);

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
    new THREE.MeshStandardMaterial()
);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
scene.add(torusKnot);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
);
sphere.position.set(5, 0, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial()
);
floor.position.set(0, - 2, 0);
floor.rotation.x = - Math.PI * 0.5;
floor.castShadow = true;
floor.receiveShadow = true;
scene.add(floor);

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, 2.25);
scene.add(directionalLight);

// Animate
const clock = new THREE.Clock();

const tick = () => {

    //* begin performance monitor
    stats.begin();

    const elapsedTime = clock.getElapsedTime();

    // Update test mesh
    torusKnot.rotation.y = elapsedTime * 0.1;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);

    //* end performance monitor
    stats.end();
};

tick();

/* ----- PERFORMANCE ----- */
//* goal = at least 60fps

//* https://discoverthreejs.com/tips-and-tricks/

/* ----- TIPS ----- */
//? Tip 1
//* stats.js - performance monitor
//* https://github.com/mrdoob/stats.js/
// npm install --save stats.js

//? Tip 2
//* disable browser fps limit

//? Tip 3
//* monitor draw calls
//* spector.js - monitors draw calls
//* https://chrome.google.com/webstore/detail/spectorjs/denbgaamihkadbghdceggmchnflmhpmk?hl=en

//? Tip 4
//* monitor renderer info
// console.log(renderer.info);

//? Tip 5
//* optimize Javascript code

//? Tip 6
//* dispose of things
// scene.remove(cube);
// cube.geometry.dispose();
// cube.material.dispose();

//? Tip 7
//* avoid unnecessary lights
//* use baked or cheap lights - AmbientLight, DirectionalLight, HemisphereLight

//? Tip 8
//* avoid adding or removing lights
//* when adding or removing light from a scene, all materials supporting it will recompile

//? Tip 9
//* avoid shadows
//* used baked shadows

//? Tip 10
//* optimize shadow map
// directionalLight.shadow.camera.top = 3;
// directionalLight.shadow.camera.right = 6;
// directionalLight.shadow.camera.left = - 6;
// directionalLight.shadow.camera.bottom = - 3;
// directionalLight.shadow.camera.far = 10;
// directionalLight.shadow.mapSize.set(1024, 1024);

// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(cameraHelper);

//? Tip 11
//* use castShadow and receiveShadow wisely
// cube.castShadow = true;
// cube.receiveShadow = false;

// torusKnot.castShadow = true;
// torusKnot.receiveShadow = false;

// sphere.castShadow = true;
// sphere.receiveShadow = false;

// floor.castShadow = false;
// floor.receiveShadow = true;

//? Tip 12
//* deactivate shadow auto update
// renderer.shadowMap.autoUpdate = false;
//* and update only when necessary
// renderer.shadowMap.needsUpdate = true;

//? Tip 13
//* resize textures
//* textures take a lot of space in GPU memory especially with mipmaps
//* texture file weights has nothing to do with GPU memory, only the resolution matters
//* try to reduce resolution while keeping decent result

//? Tip 14
//* keep a power of 2 resolution
//* doesn't have to be a square
//* if you don't, threejs will try to resize to closest power of 2 (can be up)

//? Tip 15
//* use correct file format to reduce loading time (jpg, png, etc.)
//* tinyPNG - https://tinypng.com/
//* try basis format - format like jpg and png, but stronger compression
//* hard to generate, and lossy compression

//? Tip 16
//* threejs only uses buffer geometries now, ignore tip 16

//? Tip 17
//* do not update vertices
//* bad for performance, avoid doing it, especially in tick function
//* if you need to, do it with a vertex shader

//? Tip 18
//* mutualize geometries
//* move geometry outside loops if possible
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// for (let i = 0; i < 50; i++) {

//     const material = new THREE.MeshNormalMaterial();

//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.x = (Math.random() - 0.5) * 10;
//     mesh.position.y = (Math.random() - 0.5) * 10;
//     mesh.position.z = (Math.random() - 0.5) * 10;
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2;
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2;

//     scene.add(mesh);
// };

//? Tip 19
//* merge geometries
//* use Blender or BufferGeometryUtils
//* https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils
// const geometries = [];
// for (let i = 0; i < 50; i++) {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
//     geometry.rotateX((Math.random() - 0.5) * Math.PI * 2);
//     geometry.rotateY((Math.random() - 0.5) * Math.PI * 2);
//     geometry.translate(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10
//     );
//     geometries.push(geometry);
// };
// const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
// const material = new THREE.MeshNormalMaterial();
// const mesh = new THREE.Mesh(mergedGeometry, material);
// scene.add(mesh);

//? Tip 20
//* mutualize materials
//* move materials outside loops if possible
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// const material = new THREE.MeshNormalMaterial();
// for (let i = 0; i < 50; i++) {

//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.x = (Math.random() - 0.5) * 10;
//     mesh.position.y = (Math.random() - 0.5) * 10;
//     mesh.position.z = (Math.random() - 0.5) * 10;
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2;
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2;

//     scene.add(mesh);
// };

//? Tip 21
//* use cheap materials
//* expensive - MeshStandardMaterial, MeshPhysicalMaterial
//* cheap - MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial

//? Tip 22
//* use InstancedMesh(geometry, material, count)
//* https://threejs.org/docs/#api/en/objects/InstancedMesh
//* for needing control over meshes independently, but they all use same geometry and material
//* only need one InstancedMesh for all meshes
//* if you intend to change these matrices in tick function, MUST provide this to InstancedMesh:
// mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//* provide a transformation matrix for each 'instance' of InstancedMesh
//* matrix must be Matrix4, apply transformations using available methods
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// const material = new THREE.MeshNormalMaterial();
// const mesh = new THREE.InstancedMesh(geometry, material, 50);
// scene.add(mesh);
// for (let i = 0; i < 50; i++) {
//     const position = new THREE.Vector3(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10
//     );
//     const quaternion = new THREE.Quaternion();
//     quaternion.setFromEuler(new THREE.Euler(
//         (Math.random() - 0.5) * Math.PI * 2,
//         (Math.random() - 0.5) * Math.PI * 2,
//         0
//         ));

//     const matrix = new THREE.Matrix4();
//     matrix.makeRotationFromQuaternion(quaternion);
//     matrix.setPosition(position);
//     mesh.setMatrixAt(i, matrix);
// };

//? Tip 23
//* low poly, fewer polygons the better
//* if you need details, use normal maps

//? Tip 24
//* draco compression
//* use if model has a lot of details (city, human body, etc.)
//* drawbacks - potential freeze when uncompressing geometry and have to load draco libraries

//? Tip 25
//* GZIP - compression happening on the server side
//* most servers don't GZIP files like .glb, .gltf, .obj, etc.
//* check if server is using GZIP:
//* Network tab -> click image -> Headers -> Response Headers -> content-encoding: gzip

//? Tip 26
//* field of view
//* objects not in fov will not be rendered
//* reduce fov to render less

//? Tip 27
//* near and far
//* objects outside near and far will not be rendered
//* adjust near and far to render less

//? Tip 28
//* ignore tip 28

//? Tip 29
//* pixel ratio
//* don't use default pixel ratio, always set a limit (usually 2)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//? Tip 30
//* power preferences
//* some devices can switch between GPUs or GPU usage
//* can hint at what power is required when instantiating WebGLRenderer by specifying 'powerPreference'
//* if no framerate issues, don't do it
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas,
//     powerPreference: 'high-performance',
// });

//? Tip 31
//* anti-alias
//* default anti-alias is performant, but less performant than no anti-alias
//* only add it if you have visible aliasing issues + no performance issues

//? Tip 32
//* limit passes
//* if creating own passes, try to merge them into one
//* each pass takes as many pixels as the renderer's resolution

//? Tip 33
//* specify shader precision, mediump is default
// precision: 'lowp'
//* if no quality downgrades or glitches, use lowp
//* won't work on RawShaderMaterial, have to add 'precision' on the shader (first shaders lesson)

//? Tip 34
//* keep shader code simple
//* avoid if statements
//* use swizzles and built in functions

//? Tip 35
//* use textures
//* using Perlin Noise while cool, can affect performance considerable
//* sometimes, better to use a texture representing that noise

//? Tip 36
//* use defines
//* uniforms are useful because we can tweak and animate the values in js, but bad for performance
//* if value isn't supposed to change, use defines

//? Tip 37
//* do calculations in the vertex shader and send result to fragment shader
//* usually less vertices than fragments, making calculations easier

//? Tip 38
//* keep an eye on performance FROM THE START
//* test on other devices (mobile, pc, mac, ipad, etc)
//* use tools, fix strange behavior before moving on

//! NEW - changes in red
// const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256);
// const shaderMaterial = new THREE.ShaderMaterial({
//!    precision: 'lowp',
//     uniforms:
//     {
//         uDisplacementTexture: { value: displacementTexture }
//     },
//     vertexShader: `
//!        #define DISPLACEMENT_STRENGTH 1.5
//         uniform sampler2D uDisplacementTexture;
//         varying vec2 vUv;
//!        varying vec3 vColor;

//         void main()
//         {
//             vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//             float elevation = texture2D(uDisplacementTexture, uv).r;
//!            modelPosition.y += clamp(elevation, 0.5, 1.0) * DISPLACEMENT_STRENGTH;

//             gl_Position = projectionMatrix * viewMatrix * modelPosition;

//!            float colorElevation = max(elevation, 0.25);
//!            vec3 color = mix(vec3(1.0, 0.1, 0.1), vec3(0.1, 0.0, 0.5), colorElevation);

//             vUv = uv;
//!            vColor = color;
//         }
//     `,
//     fragmentShader: `
//!        varying vec3 vColor;

//         void main()
//         {
//!            gl_FragColor = vec4(vColor, 1.0);
//         }
//     `
// });
// const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial);
// shaderMesh.rotation.x = - Math.PI * 0.5;
// scene.add(shaderMesh);

//! OLD
// const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256);
// const shaderMaterial = new THREE.ShaderMaterial({
//     uniforms:
//     {
//         uDisplacementTexture: { value: displacementTexture },
//         uDisplacementStrength: { value: 1.5 }
//     },
//     vertexShader: `
//         uniform sampler2D uDisplacementTexture;
//         uniform float uDisplacementStrength;

//         varying vec2 vUv;

//         void main()
//         {
//             vec4 modelPosition = modelMatrix * vec4(position, 1.0);

//             float elevation = texture2D(uDisplacementTexture, uv).r;
//             if(elevation < 0.5)
//             {
//                 elevation = 0.5;
//             }

//             modelPosition.y += elevation * uDisplacementStrength;

//             gl_Position = projectionMatrix * viewMatrix * modelPosition;

//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D uDisplacementTexture;

//         varying vec2 vUv;

//         void main()
//         {
//             float elevation = texture2D(uDisplacementTexture, vUv).r;
//             if(elevation < 0.25)
//             {
//                 elevation = 0.25;
//             }

//             vec3 depthColor = vec3(1.0, 0.1, 0.1);
//             vec3 surfaceColor = vec3(0.1, 0.0, 0.5);
//             vec3 finalColor = vec3(0.0);
//             finalColor.r += depthColor.r + (surfaceColor.r - depthColor.r) * elevation;
//             finalColor.g += depthColor.g + (surfaceColor.g - depthColor.g) * elevation;
//             finalColor.b += depthColor.b + (surfaceColor.b - depthColor.b) * elevation;

//             gl_FragColor = vec4(finalColor, 1.0);
//         }
//     `
// });
// const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial);
// shaderMesh.rotation.x = - Math.PI * 0.5;
// scene.add(shaderMesh);