import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";

import modelData from "./models.js";

let scene;
let camera;
let renderer;
let controls;
let loader;

let object;
let time;
let startingY;

let navButtons;
let title;
let description;
let date;

const setup = () => {
  time = 0;
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
  renderer = new THREE.WebGLRenderer({ antialias: false });

  // enabling shadows
  renderer.shadowMap.enabled = true;

  document.body.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 20;
  controls.minDistance = 5;

  loader = new GLTFLoader();

  // ground
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.translateZ(-4);
  scene.add(mesh);

  // lights
  let light;

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(0, 40, 40);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  scene.add(light);
};

const createObject = (modelID) => {
  const model = modelData[modelID] ?? modelData.default;
  const { url, offset = 0, startingRotation = 0, scale = 1 } = model;

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
          node.scale.set(scale, scale, scale);
        }
      });
      startingY = offset;
      object.rotation.y = startingRotation;
      scene.add(object);
      camera.lookAt(object);
      controls.update();

      updateUI(modelID, model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
};

const updateUI = (id, model) => {
  navButtons.forEach((button) => {
    button.parentElement.classList.remove("current");
    if (button.dataset.id === id) {
      button.parentElement.classList.add("current");
    }
  });
  const {
    title: titleCopy = "",
    description: descriptionCopy = "",
    date: dateCopy = "",
  } = model;

  title.innerText = titleCopy;
  description.innerText = descriptionCopy;
  date.innerText = dateCopy;
};

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  const upDownOffset = Math.sin(time);

  if (object) {
    object.rotation.y += 0.01;
    object.position.y = startingY + upDownOffset;
  }

  time += 0.01;
  time %= Math.PI * 2;

  renderer.render(scene, camera);
};

const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update();
};

const setupNav = () => {
  navButtons = document.querySelectorAll(".Nav__button");
  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.dataset.id;
      createObject(id);
      history.pushState(null, null, `?day=${id}`);
    });
  });

  title = document.querySelector("#title");
  description = document.querySelector("#description");
  date = document.querySelector("#date");
};

const checkForDay = () => {
  const search = window.location.search;
  const match = /day=(\d+)/.exec(search);
  if (match && match[1]) {
    createObject(match[1]);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setup();
  createObject("info");

  checkForDay();

  animate();
  window.addEventListener("resize", () => {
    resize();
  });
});
