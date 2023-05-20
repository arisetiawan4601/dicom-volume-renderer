import {
  BackSide,
  BoxGeometry,
  ClampToEdgeWrapping,
  Data3DTexture,
  FloatType,
  FrontSide,
  LinearFilter,
  Mesh,
  NearestFilter,
  NearestMipmapNearestFilter,
  PerspectiveCamera,
  RedFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getData } from "./getData";
import fragmentShaders from "../shaders/fragmentShaders";
import vertexShaders from "../shaders/vertexShaders";

let container,
  camera,
  renderer,
  geometry,
  cubeTexture,
  cubeTexture2,
  renderingTargetTexture,
  sceneFirstPass,
  materialFirstPass,
  cubeFirstPass,
  sceneSecondPass,
  materialSecondPass,
  cubeSecondPass;

export const init = async () => {
  // get data
  const {
    imageTexture,
    imageStackLength,
    imageLengthRatio,
    segmentationTexture,
    segmentationStackLength,
    segmentationLengthRatio,
  } = await getData();
  if (!imageTexture) {
    return "Error: Texture is not loaded";
  }

  // setup container element
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
  geometry = new BoxGeometry(imageLengthRatio, 1, 1);

  // Setup Texture
  cubeTexture = new Data3DTexture(imageTexture, imageStackLength, 256, 256);
  cubeTexture.generateMipmaps = false;
  cubeTexture.minFilter = LinearFilter;
  cubeTexture.magFilter = LinearFilter;
  cubeTexture.format = RedFormat;
  cubeTexture.needsUpdate = true;

  cubeTexture2 = new Data3DTexture(
    segmentationTexture,
    segmentationStackLength,
    256,
    256
  );
  cubeTexture2.generateMipmaps = false;
  cubeTexture2.minFilter = LinearFilter;
  cubeTexture2.magFilter = LinearFilter;
  cubeTexture2.format = RedFormat;
  cubeTexture2.needsUpdate = true;

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
    uniforms: {
      stackLengthRatio: { value: imageLengthRatio },
    },
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
      cubeTex2: { value: cubeTexture2 },
      steps: { value: 256 },
      stackLengthRatio: { value: imageLengthRatio },
      colorTreshLow: {},
      colorTreshHigh: {},
      alphaCorrection: {},
      contrast: {},
      brightness: {},
    },
  });
  cubeSecondPass = new Mesh(geometry, materialSecondPass);
  sceneSecondPass.add(cubeSecondPass);
  return "success";
};

export const render = (
  colorTreshLow,
  colorTreshHigh,
  alphaCorrection,
  contrast,
  brightness
) => {
  // update uniforms
  materialSecondPass.uniforms.colorTreshLow.value = colorTreshLow;
  materialSecondPass.uniforms.colorTreshHigh.value = colorTreshHigh;
  materialSecondPass.uniforms.alphaCorrection.value = alphaCorrection;
  materialSecondPass.uniforms.contrast.value = contrast;
  materialSecondPass.uniforms.brightness.value = brightness;

  // set render target to a texture
  renderer.setRenderTarget(renderingTargetTexture);
  renderer.render(sceneFirstPass, camera);

  // reset render target back to canvas
  renderer.resetState();
  renderer.render(sceneSecondPass, camera);
};
