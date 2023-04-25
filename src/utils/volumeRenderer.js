import {
  BackSide,
  BoxGeometry,
  ClampToEdgeWrapping,
  FloatType,
  FrontSide,
  ImageUtils,
  LinearFilter,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// import textureImage from "../assets/texture/foot.raw.png";
import textureImage from "../assets/texture/mri.png";
import fragmentShaders from "../shaders/fragmentShaders";
import vertexShaders from "../shaders/vertexShaders";

let container,
  camera,
  renderer,
  geometry,
  cubeTexture,
  renderingTargetTexture,
  sceneFirstPass,
  materialFirstPass,
  cubeFirstPass,
  sceneSecondPass,
  materialSecondPass,
  cubeSecondPass;
export const init = async () => {
  container = document.getElementById("3d-view");

  // Setup Camera
  camera = new PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.01,
    3000.0
  );
  camera.position.z = 2.0;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Setup Orbit Control
  new OrbitControls(camera, container);

  // Setup WebGLRenderer
  renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Setup Geometry
  geometry = new BoxGeometry(1, 1, 1);

  // Setup Texture
  cubeTexture = await new TextureLoader().loadAsync(textureImage);
  cubeTexture.generateMipmaps = false;
  // cubeTexture.minFilter = LinearFilter;
  // cubeTexture.magFilter = LinearFilter;

  // Setup First Pass Rendering Target
  renderingTargetTexture = new WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      type: FloatType,
      generateMipmaps: false,
    }
  );

  // Setup First Pass
  sceneFirstPass = new Scene();
  materialFirstPass = new ShaderMaterial({
    vertexShader: vertexShaders.firstPass,
    fragmentShader: fragmentShaders.firstPass,
    side: BackSide,
  });
  cubeFirstPass = new Mesh(geometry, materialFirstPass);
  sceneFirstPass.add(cubeFirstPass);

  // Setup Second Pass
  sceneSecondPass = new Scene();
  materialSecondPass = new ShaderMaterial({
    vertexShader: vertexShaders.secondPass,
    fragmentShader: fragmentShaders.secondPass,
    side: FrontSide,
    transparent: true,
    uniforms: {
      tex: { value: renderingTargetTexture.texture },
      cubeTex: { value: cubeTexture },
      // transferTexture: { value: transferTexture },
      colorTreshLow: { value: 0.0 },
      colorTreshHigh: { value: 1.0 },
      steps: { value: 256 },
      alphaCorrection: { value: 1.0 },
    },
  });
  cubeSecondPass = new Mesh(geometry, materialSecondPass);
  sceneSecondPass.add(cubeSecondPass);
};

// Rendering
export const render = (colorTreshLow, colorTreshHigh, alphaCorrection) => {
  // set render target to a texture
  renderer.setRenderTarget(renderingTargetTexture);
  renderer.render(sceneFirstPass, camera);

  // reset render target back to canvas
  renderer.resetState();
  renderer.render(sceneSecondPass, camera);

  // materialSecondPass.uniforms.colorTreshLow.value = colorTreshLow;
  // materialSecondPass.uniforms.colorTreshHigh.value = colorTreshHigh;
  // materialSecondPass.uniforms.alphaCorrection.value = alphaCorrection;
};

// function updateTransferFunction() {
//   const canvas = document.createElement("canvas");
//   canvas.height = 20;
//   canvas.width = 256;

//   const ctx = canvas.getContext("2d");

//   const grd = ctx.createLinearGradient(
//     0,
//     0,
//     canvas.width - 1,
//     canvas.height - 1
//   );
//   grd.addColorStop(0.0, "#ffaaff");
//   grd.addColorStop(0.5, "#affeaf");

//   ctx.fillStyle = grd;
//   ctx.fillRect(0, 0, canvas.width - 1, canvas.height - 1);

//   const img = document.getElementById("transferFunctionImg");
//   img.src = canvas.toDataURL();
//   img.style.width = "256 px";
//   img.style.height = "128 px";

//   const transferTexture = new Texture(canvas);
//   transferTexture.wrapS = ClampToEdgeWrapping;
//   transferTexture.wrapT = ClampToEdgeWrapping;
//   transferTexture.needsUpdate = true;

//   return transferTexture;
// }
