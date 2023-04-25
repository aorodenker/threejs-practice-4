import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import tintVertex from './shaders/tint/tintVertex.js';
import tintFragment from './shaders/tint/tintFragment.js';
import displacementVertex from './shaders/displacement/displacementVertex.js';
import displacementFragment from './shaders/displacement/displacementFragment.js';
import normalTestVertex from './shaders/normalTest/normalTestVertex.js';
import normalTestFragment from './shaders/normalTest/normalTestFragment.js';
import * as dat from 'lil-gui';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

// Update All Materials
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = 2.5;
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

// Models
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) => {
        gltf.scene.scale.set(2, 2, 2);
        gltf.scene.rotation.y = Math.PI * 0.5;
        scene.add(gltf.scene);

        updateAllMaterials();
    }
);

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
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

    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Post Processing
const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        samples: renderer.getPixelRatio() === 1 ? 2 : 0
    }
);

// Effect Composer
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

// Render Pass
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// Dot Screen Pass
const dotScreenPass = new DotScreenPass();
effectComposer.addPass(dotScreenPass);
dotScreenPass.enabled = false;

// Glitch Pass
const glitchPass = new GlitchPass();
glitchPass.goWild = false;
effectComposer.addPass(glitchPass);
glitchPass.enabled = false;

// Shader Pass
const rgbShiftShader = new ShaderPass(RGBShiftShader);
effectComposer.addPass(rgbShiftShader);
rgbShiftShader.enabled = false;

// Gamma Correction Pass
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

// Unreal Bloom Pass
const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass);
unrealBloomPass.enabled = false;

gui.add(unrealBloomPass, 'enabled');
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001);
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001);
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001);

// Custom Pass: Tint Shader
const TintShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTint: { value: null }
    },
    vertexShader: tintVertex,
    fragmentShader: tintFragment
};

const tintPass = new ShaderPass(TintShader);
tintPass.material.uniforms.uTint.value = new THREE.Vector3();
effectComposer.addPass(tintPass);

gui.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red');
gui.add(tintPass.material.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('green');
gui.add(tintPass.material.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('blue');

// Custom Pass: Normal Test Shader
const NormalTestShader = {
    uniforms: {
        tDiffuse: { value: null },
        uNormalMap: { value: null }
    },
    vertexShader: normalTestVertex,
    fragmentShader: normalTestFragment
};

const normalTestShader = new ShaderPass(NormalTestShader);
normalTestShader.material.uniforms.uNormalMap.value = textureLoader.load('./textures/interfaceNormalMap.png');
effectComposer.addPass(normalTestShader);

// SMAA Pass
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass();
    effectComposer.addPass(smaaPass);
};

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update Passes

    controls.update();
    effectComposer.render();
    window.requestAnimationFrame(tick);
};

tick();

/* ----- POST PROCESSING ----- */
//* https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing
//? EffectComposer(renderer, rendererTarget:optional)
//? RenderPass(scene, camera)

//! Effect Composer
//* https://threejs.org/docs/#examples/en/postprocessing/EffectComposer

// Encoding
//* By default EffectComposer doesn't support sRGBEncoding, but we can add a pass to fix this
//* GammaCorrectionShader - convert linear encoding to sRGBEncoding
//* must be used AFTER all classical passes (not anti aliasing) to apply correction on final colors
//* not great for performance, but only way to fix encoding

// Anti-Aliasing
//* By default EffectComposer uses WebGLRenderTarget without anti-aliasing
//* FXAA (fast approximate) - low quality, high performance
//* SMAA (subpixel morphological) - medium quality, medium performance
//* SSAA (super sampling) - high quality, low performance
//* TAA (temporal) - high performance but limited results

//? Effect Composer
//* 1) create effect composer
// const effectComposer = new EffectComposer(renderer, renderTarget:optional);
//* set pixel ratio for effect composer, as default use renderer size - device pixel ratio with max of 2
// effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//* set the size of the effect composer, as default use renderer size
// effectComposer.setSize(sizes.width, sizes.height);

//* 2) instead of using the renderer to render, use effect composer to handle passes AND rendering
// const tick = () => {
    //...

    // renderer.render(scene, camera);
    //* effectComposer.render(scene, camera) uses scene and camera from instantiation above
    // effectComposer.render();

    //...
// };

//* 3) update effect composer on resize
// window.addEventListener('resize', () => {
    //...

    // effectComposer.setSize(sizes.width, sizes.height);
    // effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// });

// TODO: Fixing Anti-Aliasing (stairs)
// Solutions:
//* 1) Provide our own render target where we add anti-aliasing
//* won't work on all modern browsers

//* https://threejs.org/docs/#api/en/renderers/WebGLRenderTarget
//* samples re-activates anti-aliasing
//* samples - defines the count of MSAA(multisample anti-aliasing) samples, default is 0
//* if the user has a pixel ratio of 2 or higher, pixel density is high enough to not notice aliasing
//* in this case, set samples to 0 for performance
// const renderTarget = new THREE.WebGLRenderTarget(
//     800,
//     600,
//     {
//         samples: renderer.getPixelRatio() === 1 ? 2 : 0
//     }
// );

//* 2) Use a pass to do anti-aliasing
//* worse performance and slightly different result
// const smaaPass = new SMAAPass();
// effectComposer.addPass(smaaPass);

//* 3) Combination of the two above - BEST solution
//* check if browser supports anti-aliasing on render target
//* if it does, do #1 - provide our own render target where we add anti-aliasing
//* if not, do #2 - use a pass to do anti-aliasing
// const renderTarget = new THREE.WebGLRenderTarget(
//     800,
//     600,
//     {
//         samples: renderer.getPixelRatio() === 1 ? 2 : 0
//     }
// );

//* if pixel ratio 2 or higher AND browser does not have WebGL2 capabilities, do anti-aliasing pass
// if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
//     const smaaPass = new SMAAPass();
//     effectComposer.addPass(smaaPass);
// };

//? Render Pass
//* create render pass variable
// const renderPass = new RenderPass(scene, camera);
//* add a render pass
// effectComposer.addPass(renderPass);

//? Dot Screen Pass
// const dotScreenPass = new DotScreenPass();
// effectComposer.addPass(dotScreenPass);
//* toggle pass use
// dotScreenPass.enabled = false;

//? Glitch Pass
// const glitchPass = new GlitchPass();
// effectComposer.addPass(glitchPass);
//* passes have properties you can enable/disable/adjust
// glitchPass.goWild = false;

//? Unreal Bloom Pass
// const unrealBloomPass = new UnrealBloomPass();
// unrealBloomPass.strength = 0.3;
// unrealBloomPass.radius = 1;
// unrealBloomPass.threshold = 0.6;
// effectComposer.addPass(unrealBloomPass);

//? SMAA Pass
// const smaaPass = new SMAAPass();
// effectComposer.addPass(smaaPass);

//! Shader Pass
//? RGB Shift Shader
//* create RGB Shift Shader pass variable - ShaderPass(pass)
// const rgbShiftShader = new ShaderPass(RGBShiftShader);
//* add shader pass
// effectComposer.addPass(rgbShiftShader);

// TODO: Fixing Encoding (light/color)
//? Gamma Correction Pass
//* create gamma correction pass variable - ShaderPass(pass)
// const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
//* add shader pass
// effectComposer.addPass(gammaCorrectionPass);

//! Custom Pass
//? Tint Shader
//* ./shaders/tint/tintVertex & tintFragment

//* take texture from previous pass by using uniform tDiffuse: { value: null }
// const TintShader = {
//     uniforms: {
//         tDiffuse: { value: null },
//         uTint: { value: null }
//     },
//     vertexShader: tintVertex,
//     fragmentShader: tintFragment
// };

// const tintPass = new ShaderPass(TintShader);
// tintPass.material.uniforms.uTint.value = new THREE.Vector3();
// effectComposer.addPass(tintPass);

// gui.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red');
// gui.add(tintPass.material.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('green');
// gui.add(tintPass.material.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('blue');

//? Displacement Shader
//* ./shaders/displacement/displacementVertex & displacementFragment

// const DisplacementShader = {
//     uniforms: {
//         tDiffuse: { value: null },
//         uTime: { value: null }
//     },
//     vertexShader: displacementVertex,
//     fragmentShader: displacementFragment
// };

// const displacementPass = new ShaderPass(DisplacementShader);
// displacementPass.material.uniforms.uTime.value = 0;
// effectComposer.addPass(displacementPass);

// const tick = () => {
    //...

    //* Update Passes - time based shader animation
    // displacementPass.material.uniforms.uTime.value = elapsedTime;

    //...
//};

//? Normal Test Shader
//* ./shaders/normalTest/normalTestVertex & normalTestFragment
// const NormalTestShader = {
//     uniforms: {
//         tDiffuse: { value: null },
//         uNormalMap: { value: null }
//     },
//     vertexShader: normalTestVertex,
//     fragmentShader: normalTestFragment
// };

// const normalTestShader = new ShaderPass(NormalTestShader);
// normalTestShader.material.uniforms.uNormalMap.value = textureLoader.load('./textures/interfaceNormalMap.png');
// effectComposer.addPass(normalTestShader);