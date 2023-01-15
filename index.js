import * as THREE from "https://cdn.skypack.dev/three@0.148.0";
import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';

//VARIABLES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const white = 0xffffff;
const yellow = 0xffc800;
const red = 0xff0000;
const purple = 0xa200ff;
const green = 0x03fc2c;
const blue = 0x031cfc;
const cyan = 0x03d3fc;
const black = 0x000000;
const pink = 0xff7dcd;
const lightYellow = 0xffe97d;
const violet = 0x6a00ff;

//SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(black);
scene.fog = new THREE.Fog(black, 4, 6);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper)

//LIGHT SCENE1
let lightTopColor = new THREE.Color(yellow);
let lightBackColor = new THREE.Color(red);
let rectLightColor = new THREE.Color(purple);

const lightTop = new THREE.PointLight(lightTopColor, 10);
lightTop.position.set(5, 5, 2);
lightTop.castShadow = true;
lightTop.shadow.mapSize.width = lightTop.shadow.mapSize.height = 10000;
lightTop.penumbra = 0.5;

const lightBack = new THREE.SpotLight(lightBackColor, 2);
lightBack.position.set(0, -3, -1);

const rectLight = new THREE.RectAreaLight(rectLightColor, 20, 2, 2);
rectLight.position.set(1, 1, 1);
rectLight.lookAt(0, 0, 0);

scene.add(lightTop, lightBack, rectLight);

//LIGHT SCENE2
const targetScene2 = new THREE.Object3D();
targetScene2.position.set(0, -10, 0);
scene.add(targetScene2);

const lightRight = new THREE.SpotLight(pink, 1);
lightRight.position.set(8, 0, 0);
lightRight.target = targetScene2;

const lightLeft = new THREE.SpotLight(pink, 1);
lightLeft.position.set(-8, 0, 0);
lightLeft.target = targetScene2;

const lightMidSpot = new THREE.SpotLight(lightYellow, 2);
lightMidSpot.position.set(0, -5, 20);
lightMidSpot.target = targetScene2;

const lightMidPoint = new THREE.PointLight(lightYellow, 0.05);
lightMidPoint.position.set(0, 0, -23);

scene.add(lightRight,lightLeft, lightMidSpot, lightMidPoint);


//CAMERA  scene1(-0.3, 0, 5)   scene2(0, -4.5, 10)
let updateCamPos = new THREE.Vector3(-0.3, 0, 5);
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 1, 500);
camera.position.set(-0.3, 0, 5);
scene.add(camera);

//RENDERER
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.needsUpdate = true;

//SCENE1 OBJECTS
//Cubes
const cubesGroup = new THREE.Object3D();
scene.add(cubesGroup);
function mathRandom(num = 1) {
  var setNumber = -Math.random() * num + Math.random() * num;
  return setNumber;
}
function generateCube(number) {
  for (let i = 0; i < number; i++) {
    //Throw random shape
    const oneOrZero = Math.round(Math.random());
    let geometry;
    if (oneOrZero === 0) {
      geometry = new THREE.IcosahedronGeometry(1);
    } else {
      geometry = new THREE.DodecahedronGeometry(1);
    }
    //Init object
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
      metalness: 0.5,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.speedRotation = Math.random() * 0.1;
    cube.positionX = mathRandom();
    cube.positionY = mathRandom();
    cube.positionZ = mathRandom();
    cube.castShadow = true;
    cube.receiveShadow = true;
    //Behavior
    const newScaleValue = mathRandom(0.3);
    cube.scale.set(newScaleValue, newScaleValue, newScaleValue);
    cube.rotation.x = mathRandom((180 * Math.PI) / 180);
    cube.rotation.y = mathRandom((180 * Math.PI) / 180);
    cube.rotation.z = mathRandom((180 * Math.PI) / 180);
    cube.position.set(cube.positionX, cube.positionY, cube.positionZ);
    cubesGroup.add(cube);
  }
}
//Particles
const particlesGroup = new THREE.Object3D();
scene.add(particlesGroup);
function generateParticle(number, spaceSize) {
  const geometry = new THREE.CircleGeometry(0.1, 5);
  const material = new THREE.MeshPhysicalMaterial({
    color: white,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < number; i++) {
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(mathRandom(spaceSize), mathRandom(spaceSize), mathRandom(spaceSize));
    particle.rotation.set(mathRandom(), mathRandom(), mathRandom());
    const scale = 0.001 + Math.abs(mathRandom(0.03));
    particle.scale.set(scale, scale, scale);
    particle.speedValue = mathRandom(1);
    particlesGroup.add(particle);
  }
}

//SCENE2 OBJECTS
//Globe
let wave = new THREE.Vector3();
let noise = openSimplexNoise.makeNoise4D(Date.now());
let clock = new THREE.Clock();

const earthGroup = new THREE.Object3D();
earthGroup.position.set(0, 0, -10);
earthGroup.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
scene.add(earthGroup);

function generateEarth() {
  const geometry = new THREE.CylinderGeometry(4, 3, 10, 60, 30, true);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ffa6,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  geometry.positionData = [];
  for (let i = 0; i < geometry.attributes.position.count; i++){
    wave.fromBufferAttribute(geometry.attributes.position, i);
    geometry.positionData.push(wave.clone());
  }
  const earth = new THREE.Mesh(geometry, material);
  earth.castShadow = true;
  earth.receiveShadow = true;
  earthGroup.add(earth);
}

//Clouds
function generateCloud(number) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd000,
    roughness: 0.4,
    metalness: 1,
    transparent: true,
    opacity: 0.7,
    fog: false,
  });
  for (let i = 0; i < number; i++ ) {
    const cloudGroup = new THREE.Object3D();
    const cloudAmount = Math.floor(Math.random()*3+2);
    for (let i = 0; i < cloudAmount; i++ ) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const cloud = new THREE.Mesh(geometry, material);
      const scale = 0.27/Math.floor(Math.random()*2+1);
      cloud.scale.set(scale, scale, scale);
      cloud.position.set(Math.random()/2, Math.random()/2, 0)
      cloud.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
      cloud.castShadow = true;
      cloud.receiveShadow = true;
      cloudGroup.add(cloud);
    }
    cloudGroup.position.set(0, Math.random()*5+2, Math.random()+4.5);
    cloudGroup.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI*2*(Math.random()*10)));
    earthGroup.add(cloudGroup);
  }
}

//Stars
const starGroup = new THREE.Object3D();
scene.add(starGroup);
function generateStar() {
  const ranSize = Math.random()*0.01+0.01;
  const geometry = new THREE.SphereGeometry(ranSize, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: black, fog: false });
  const star = new THREE.Mesh(geometry, material);
  star.position.set(Math.random()*18-9, Math.random()*10-9, Math.random()*20-30);
  starGroup.add(star);
}

//Airplane
let airPlaneNewPos = new THREE.Vector3(0, -5, -5);
let count = 1;

const airPlaneGroup = new THREE.Object3D();
airPlaneGroup.position.set(0, -5, -5);
airPlaneGroup.scale.set(0.35, 0.35, 0.35),
scene.add(airPlaneGroup);

function generateAirPlane() {
  const matWhite = new THREE.MeshStandardMaterial({
    color: white,
    emissive: 0x5e5e5e,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  const matPurple = new THREE.MeshStandardMaterial({
    color: violet,
    emissive: 0x1c0f45,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  const matBlack = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });
  const flagText = new THREE.TextureLoader().load("./images/peace-flag.jpg");
  const matFlag = new THREE.MeshStandardMaterial({
    map: flagText,
    roughness: 0.5,
    metalness: 1,
    flatShading: true,
    fog: false,
  });

  const fan1Geo = new THREE.BoxGeometry(0.05, 1.2, 0.2);
  const fan1 = new THREE.Mesh(fan1Geo, matWhite);
  fan1.position.set(1.3, 0, 0);
  airPlaneGroup.add(fan1);

  const fan2Geo = new THREE.BoxGeometry(0.05, 0.2, 1.2);
  const fan2 = new THREE.Mesh(fan2Geo, matWhite);
  fan2.position.set(1.3, 0, 0);
  airPlaneGroup.add(fan2);

  const flagGeo = new THREE.PlaneGeometry(1.4, 0.8, 10, 1);
  const flag = new THREE.Mesh(flagGeo, matFlag);
  flag.position.set(-1.45, 0, 0);
  airPlaneGroup.add(flag);
  count = flagGeo.attributes.position.count;

  const headGeo = new THREE.TorusGeometry(0.35, 0.2, 8, 20);
  const head = new THREE.Mesh(headGeo, matWhite);
  head.rotation.set(0, Math.PI/2, 0);
  head.position.set(0.95, 0, 0);
  airPlaneGroup.add(head);

  const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 20, 1, true);
  const body = new THREE.Mesh(bodyGeo, matPurple);
  body.rotation.set(0, 0, Math.PI/2);
  body.position.set(0.6, 0, 0);
  airPlaneGroup.add(body);

  const tailGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.7, 20, 1, true);
  const tail = new THREE.Mesh(tailGeo, matPurple);
  tail.rotation.set(0, 0, Math.PI/2);
  tail.position.set(0, 0, 0);
  airPlaneGroup.add(tail);

  const endGeo = new THREE.ConeGeometry(0.3, 0.3, 20, 1, true);
  const end = new THREE.Mesh(endGeo, matPurple);
  end.rotation.set(0, 0, Math.PI/2);
  end.position.set(-0.5, 0, 0);
  airPlaneGroup.add(end);

  const fanCenGeo = new THREE.ConeGeometry(0.2, 0.3, 20, 1, true);
  const fanCen = new THREE.Mesh(fanCenGeo, matBlack);
  fanCen.rotation.set(0, 0, -Math.PI/2);
  fanCen.position.set(1.3, 0, 0);
  airPlaneGroup.add(fanCen);

  const wingGeo = new THREE.BoxGeometry( 0.7, 0.06, 3);
  const wing = new THREE.Mesh(wingGeo, matWhite);
  wing.position.set(0.4, 0.15, 0);
  wing.rotation.set(0, 0, Math.PI/20);
  airPlaneGroup.add(wing);

  const wheelGeo = new THREE.TorusGeometry(0.12, 0.13, 10, 10);
  const wheel1 = new THREE.Mesh(wheelGeo, matBlack);
  wheel1.position.set(0.4, -0.4, 0.6);
  airPlaneGroup.add(wheel1);
  const wheel2 = new THREE.Mesh(wheelGeo, matBlack);
  wheel2.position.set(0.4, -0.4, -0.6);
  airPlaneGroup.add(wheel2);

  const pilotGeo = new THREE.SphereGeometry(0.3, 10, 10);
  const pilot = new THREE.Mesh(pilotGeo, matWhite);
  pilot.position.set(0.23, 0.55, 0);
  airPlaneGroup.add(pilot);

  const helmet = new THREE.Mesh(wheelGeo, matBlack);
  helmet.scale.set(1, 1.5, 1);
  helmet.position.set(0.375, 0.65, 0);
  helmet.rotation.set(Math.PI/2, 0, 0);
  airPlaneGroup.add(helmet);
}

//RESIZE WINDOW
function handleWindowResize() {
  //Update Sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  //Update Camera
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", handleWindowResize, false);

//MOUSE EVENT
const mouse = new THREE.Vector2();
function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 + 1;
  //Update airplane
  airPlaneNewPos.x = (event.clientX * 3 / window.innerWidth) - 1.5;
  airPlaneNewPos.y = - (event.clientY * 1.6 / window.innerHeight) - 4.2;
  airPlaneGroup.rotation.z = airPlaneGroup.rotation.x = airPlaneNewPos.y - airPlaneGroup.position.y;
}
window.addEventListener("mousemove", onMouseMove, false);

//TOUCH EVENT FOR MOBILE
function onTouchMove(event) {
  event.preventDefault();
  mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
  //Update airplane
  airPlaneNewPos.x = (event.clientX * 3 / window.innerWidth) - 1.5;
  airPlaneNewPos.y = - (event.clientY * 1.6 / window.innerHeight) - 4.2;
  airPlaneGroup.rotation.z = airPlaneGroup.rotation.x = airPlaneNewPos.y - airPlaneGroup.position.y;
}
window.addEventListener("touchmove", onTouchMove, false);

//UPDATE ACTIVE SECTION ON SCREEN
let options = {rootMargin: "0px", threshold: 0.75};
const callback = (entries) => {
  entries.forEach((entry) => {
    const { target } = entry;
    if (entry.intersectionRatio >= 0.75) {
      target.classList.add("is-visible");
    } else {
      target.classList.remove("is-visible");
    }
  });
};
const observer = new IntersectionObserver(callback, options);
document.querySelectorAll("section").forEach((section) => {
  observer.observe(section);
});

//EXPAND NAVBAR HAMBURGER
document
  .querySelector(".hamburger")
  .addEventListener("click", function(event) {
    event.preventDefault();
    if (this.classList.contains("is-active")) {
      this.classList.remove("is-active");
      document.querySelector(".subMenu").style.display = "none";
    } else {
      this.classList.add("is-active");
      document.querySelector(".subMenu").style.display = "flex";
    }
});

//COLLAPSE SUBMENU ON CHOOSE
const navLinks = document.querySelectorAll(".navEach");
navLinks.forEach((each) => {
  each.addEventListener("click", function(event) {
    if (document.querySelector(".subMenu").style.display === "flex") {
      document.querySelector(".subMenu").style.display = "none";
      document.querySelector(".hamburger").classList.remove("is-active");
    } 
  })
})

//BUTTON PAGE UP
document
  .querySelector(".moveUp")
  .addEventListener("click", function(event) {
    if (staticSectionNumber === 2) {
      this.getAttribute("href");
      this.setAttribute("href", "#section1");
    }
    if (staticSectionNumber === 3) {
      this.getAttribute("href");
      this.setAttribute("href", "#section2");
    }
    if (staticSectionNumber === 4) {
      this.getAttribute("href");
      this.setAttribute("href", "#section3");
    }
});

//BUTTON BACK TO TOP
document
  .querySelector(".backToTop")
  .addEventListener("click", function(event) {
    highLightNavLink(1);
    changeFooter(2);
    toggleStars(black);
    lightTopColor.setHex(yellow);
    lightBackColor.setHex(red);
    rectLightColor.setHex(purple);
    updateCamPos.set(-0.3, 0, 5);
});

//SOUND TOGGLE
const backgroundSound = new Audio("./audios/Gratitude_Spiritual-Moment.mp3");
let soundOn = false;
document
  .querySelector(".sound")
  .addEventListener("click", function(event) {
    event.preventDefault();
    if (soundOn === true) {
      this.style.opacity = 1;
      backgroundSound.pause();
      this.style.backgroundImage = "url('./icons/icon-mute-96.png')";
      soundOn = false;
    } else {
      this.style.opacity = 0.2;
      backgroundSound.play();
      backgroundSound.volume = 0.5;
      backgroundSound.loop = true;
      this.style.backgroundImage = "url('./icons/icon-sound-96.png')";
    soundOn = true;
    }
});

//WHOOSH SOUND
document.querySelectorAll("a").forEach((each) => {
  each.addEventListener("click", function(event) {
    const whoosh = new Audio("./audios/Whoosh.mp3");
    whoosh.play();
  });
});

//FUNCTIONS FOR ANIMATION
//highlight navlink according to section
let sections = document.querySelectorAll("section");
let staticSectionNumber = 1;
function highLightNavLink(number) {
  navLinks.forEach((each) => {
    each.style.color = "beige";
    each.style.fontStyle = "normal";
    each.classList.remove("is-on");
  });
  if (number > 1) {
    navLinks[number - 2].style.color = "goldenrod";
    navLinks[number - 2].style.fontStyle = "italic";
    navLinks[number - 2].classList.add("is-on");
    navLinks[number + 2].style.color = "goldenrod";
    navLinks[number + 2].style.fontStyle = "italic";
  }
}
//change footer according to section
function changeFooter(setting) {
  if (setting === 0) {
    document.querySelector("footer").style.justifyContent = "space-between";
    document.querySelector(".backToTop").style.display = "block";
    document.querySelector(".copyright").style.display = "flex";
    document.querySelector(".moveUp").style.display = "none";
  } else if (setting === 1) {
    document.querySelector("footer").style.justifyContent = "flex-end";
    document.querySelector(".backToTop").style.display = "none";
    document.querySelector(".copyright").style.display = "none";
    document.querySelector(".moveUp").style.display = "block";
  } else if (setting === 2) {
    document.querySelector("footer").style.justifyContent = "flex-end";
    document.querySelector(".backToTop").style.display = "none";
    document.querySelector(".copyright").style.display = "none";
    document.querySelector(".moveUp").style.display = "none";
  } else  {
    document.querySelector("footer").style.justifyContent = "flex-end";
    document.querySelector(".backToTop").style.display = "none";
    document.querySelector(".copyright").style.display = "none";
    if (window.innerWidth <= 768) {
      document.querySelector(".moveUp").style.display = "block";
    } else {
      document.querySelector(".moveUp").style.display = "none";
    }
  }
}
//toggle stars
function toggleStars(color) {
  starGroup.children.forEach((each) => {
    each.material.color.setHex(color);
  })
}


//ANIMATION
const animate = () => {
  //Scene1
  //Particles spin around
  particlesGroup.rotation.y += 0.004;
  
  //Particles rotate
  const time = performance.now() * 0.0003;
  for (let i = 0; i < particlesGroup.children.length; i++) {
    particlesGroup.children[i].rotation.x += particlesGroup.children[i].speedValue / 10;
    particlesGroup.children[i].rotation.y += particlesGroup.children[i].speedValue / 10;
    particlesGroup.children[i].rotation.z += particlesGroup.children[i].speedValue / 10;
  }
  
  //Cubes rotate & fly around
  for (let i = 0; i < cubesGroup.children.length; i++) {
    cubesGroup.children[i].rotation.x += 0.001;
    cubesGroup.children[i].rotation.y += 0.002;
    cubesGroup.children[i].rotation.z += 0.003;
    cubesGroup.children[i].position.x =
      Math.sin(time * cubesGroup.children[i].positionZ) * cubesGroup.children[i].positionY;
    cubesGroup.children[i].position.y =
      Math.cos(time * cubesGroup.children[i].positionX) * cubesGroup.children[i].positionZ;
    cubesGroup.children[i].position.z =
      Math.sin(time * cubesGroup.children[i].positionY) * cubesGroup.children[i].positionX;
  }
  
  //Cube group rotate follow mouse
  cubesGroup.rotation.y -= (mouse.x * 4 + cubesGroup.rotation.y) * 0.1;
  cubesGroup.rotation.x -= (-mouse.y * 4 + cubesGroup.rotation.x) * 0.1;
  
  //Scene2
  //Earth spin around
  earthGroup.rotation.y -= 0.005;
  
  //Earth wave
  earthGroup.children[0].geometry.positionData.forEach((p, idx) => {
    let setNoise = noise(p.x, p.y, p.z, clock.getElapsedTime());
    wave.copy(p).addScaledVector(p, setNoise);
    // earth.geometry.attributes.position.setXYZ(idx, wave.x, wave.y, wave.z);
    earthGroup.children[0].geometry.attributes.position.setY(idx, wave.y);
  })
  earthGroup.children[0].geometry.computeVertexNormals();
  earthGroup.children[0].geometry.attributes.position.needsUpdate = true;
  
  //Airplane fan
  airPlaneGroup.children[0].rotation.x += 0.3;
  airPlaneGroup.children[1].rotation.x += 0.3;
  
  //Airplane flag
  for (let i = 0; i < count; i++) {
    const x = airPlaneGroup.children[2].geometry.attributes.position.getX(i);
    const y = airPlaneGroup.children[2].geometry.attributes.position.getY(i);
    const xangle = x + Date.now() / 200;
    const xsin = Math.sin(xangle) * 0.6;
    const yangle = y + Date.now() / 200;
    const ycos = Math.cos(yangle) * 0.1;
    airPlaneGroup.children[2].geometry.attributes.position.setZ(i, xsin + ycos)
  }
  airPlaneGroup.children[2].geometry.computeVertexNormals();
  airPlaneGroup.children[2].geometry.attributes.position.needsUpdate = true;

  //Move airplane follow mouse
  airPlaneGroup.position.lerp(airPlaneNewPos, 0.1);

  //Check current section on screen
  let currentSection = document.querySelector(".is-visible");
  if (currentSection === sections[0]) {
    const sectionNumber = 1;
    if (sectionNumber !== staticSectionNumber) {
      highLightNavLink(sectionNumber);
      changeFooter(2);
      lightTopColor.setHex(yellow);
      lightBackColor.setHex(red);
      rectLightColor.setHex(purple);
      staticSectionNumber = sectionNumber;
    }
  }
  if (currentSection === sections[1]) {
    const sectionNumber = 2;
    if (sectionNumber !== staticSectionNumber) {
      highLightNavLink(sectionNumber);
      changeFooter(1);
      toggleStars(black);
      lightTopColor.setHex(green);
      lightBackColor.setHex(yellow);
      rectLightColor.setHex(purple);
      updateCamPos.set(-0.3, 0, 5);
      staticSectionNumber = sectionNumber;
    }
  }
  if (currentSection === sections[2]) {
    const sectionNumber = 3;
    if (sectionNumber !== staticSectionNumber) {
      highLightNavLink(sectionNumber);
      changeFooter(3);
      toggleStars(black);
      lightTopColor.setHex(cyan);
      lightBackColor.setHex(purple);
      rectLightColor.setHex(blue);
      updateCamPos.set(-0.3, 0, 5);
      staticSectionNumber = sectionNumber;
    }
  }
  if (currentSection === sections[3]) {
    const sectionNumber = 4;
    if (sectionNumber !== staticSectionNumber) {
      highLightNavLink(sectionNumber);
      changeFooter(3);
      toggleStars(black);
      lightTopColor.setHex(red);
      lightBackColor.setHex(purple);
      rectLightColor.setHex(blue);
      updateCamPos.set(-0.3, 0, 5);
      staticSectionNumber = sectionNumber;
    }
  }
  if (currentSection === sections[4]) {
    const sectionNumber = 5;
    if (sectionNumber !== staticSectionNumber) {
      highLightNavLink(sectionNumber);
      changeFooter(0);
      toggleStars(0x545454);
      lightTopColor.setHex(black);
      lightBackColor.setHex(black);
      rectLightColor.setHex(black);
      updateCamPos.set(0, -4.5, 10);
      staticSectionNumber = sectionNumber;
    }
  }

  //Update screen
  camera.position.lerp(updateCamPos, 0.1);
  lightTop.color.lerp(lightTopColor, 0.1);
  lightBack.color.lerp(lightBackColor, 0.1);
  rectLight.color.lerp(rectLightColor, 0.1);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

window.scrollTo({ top: 0, behavior: "smooth" });
generateParticle(200, 2);
generateCube(30);
generateEarth();
generateCloud(60);
Array(80).fill().forEach(generateStar);
generateAirPlane();
animate();