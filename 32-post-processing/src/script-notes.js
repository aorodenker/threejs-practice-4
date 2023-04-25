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