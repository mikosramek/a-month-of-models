import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";

let scene;
let camera;
let renderer;
let controls;

let loader;
let object;

const setup = () => {
  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 40);
  // camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 4, 7);

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });

  // enabling shadows
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.BasicShadowMap;

  document.body.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 20;
  controls.minDistance = 5;

  // scene.add(new THREE.AmbientLight(0x404040, 3));

  loader = new GLTFLoader();

  // const geometry = new THREE.PlaneGeometry(20, 20);
  // const material = new THREE.MeshStandardMaterial({
  //   color: 0xffffff,
  // });
  // const plane = new THREE.Mesh(geometry, material);
  // plane.receiveShadow = true;
  // plane.castShadow = false;
  // plane.rotation.x = -Math.PI / 2;
  // plane.translateZ(-4);
  // scene.add(plane);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.translateZ(-4);
  scene.add(mesh);

  // light
  let light;

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  // const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  // dirLight.position.set(-3, 10, -10);
  // dirLight.castShadow = true;
  // scene.add(dirLight);
  light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(0, 40, 40);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  scene.add(light);

  // light = new THREE.PointLight(0xffffff, 1, 0, 0);
  // // light.target.position.set(0, 0, 0);
  // light.position.set(0, 10, 0);
  // light.castShadow = true;
  // scene.add(light);

  // light = new THREE.DirectionalLight(0xffffff, 2);
  // light.position.set(0, -10, 10);
  // light.target.position.set(0, 0, 0);
  // light.castShadow = true;
  // scene.add(light);

  // light = new THREE.AmbientLight(0xffffff, 2);
  // scene.add(light);
};

const modelMap = {
  default: {
    url: "/public/question-mark.gltf",
    offset: -1,
    startingRotation: 3.3,
  },
  1: {
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF/Duck.gltf",
    offset: -1,
    startingRotation: 0,
  },
};

export const createObject = (modelID) => {
  const { url, offset, startingRotation } =
    modelMap[modelID] ?? modelMap.default;
  loader.load(
    url,
    function (gltf) {
      if (object) {
        scene.remove(object);
      }
      object = gltf.scene;
      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      object.translateY(offset);
      object.rotation.y = startingRotation;
      scene.add(object);
      camera.lookAt(object);
      controls.update();
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
};

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  if (object) {
    object.rotation.y += 0.01;
  }
};

const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update();
};

const setupNav = () => {
  const buttons = document.querySelectorAll(".Nav__button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.dataset.id;
      createObject(id);
      buttons.forEach((button) => {
        button.parentElement.classList.remove("current");
      });
      button.parentElement.classList.add("current");
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setup();
  createObject();
  animate();

  window.addEventListener("resize", () => {
    resize();
  });
});
