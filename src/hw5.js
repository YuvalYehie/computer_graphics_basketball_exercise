import {OrbitControls} from './OrbitControls.js'

console.log("HW5 script is running and updated");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 50;

directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// === MOVE HOOP CONSTANTS AND FUNCTION DEFINITION HERE ===
const HOOP_HEIGHT = 3.05; // Regulation 10 feet in meters (approx)
const BACKBOARD_WIDTH = 2.4;
const BACKBOARD_HEIGHT = 1.5;
const RIM_RADIUS = 0.4; 
const POLE_HEIGHT = HOOP_HEIGHT + 1.5; // Pole extends above the rim
const POLE_RADIUS = 0.1;
const SUPPORT_ARM_LENGTH = 1.0;

// Function to create a single basketball hoop
function createBasketballHoop(xPosition) {
  const hoopGroup = new THREE.Group();
  
  // Determine if this is the right side hoop
  const isRightSide = xPosition > 0;
  
  // 1. Backboard (white, partially transparent)
  const backboardGeometry = new THREE.BoxGeometry(BACKBOARD_WIDTH, BACKBOARD_HEIGHT, 0.05);
  const backboardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff, // White
    transparent: true,
    opacity: 1.0, // Partially transparent
    shininess: 100
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  
  // Position backboard - should be behind the rim
  const RIM_OFFSET = 0.15; // Distance from backboard to rim
  backboard.position.set(0, HOOP_HEIGHT + 0.5, -RIM_OFFSET);
  
  backboard.castShadow = true;
  backboard.receiveShadow = true;
  hoopGroup.add(backboard);

  // 2. Rim (orange) at the correct regulation height
  // Using a TorusGeometry for the rim
  const rimGeometry = new THREE.TorusGeometry(RIM_RADIUS, 0.04, 16, 64);
  const rimMaterial = new THREE.MeshPhongMaterial({
    color: 0xff4500, // Orange
    shininess: 80
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = Math.PI / 2; // Rotate to be horizontal
  
  // Position rim in front of backboard
  rim.position.set(0, HOOP_HEIGHT, RIM_OFFSET);
  
  rim.castShadow = true;
  hoopGroup.add(rim);

  // 3. Net implemented with line segments
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // White net
  const netSegments = 20; // Number of vertical segments for the net
  const netDepth = 0.7; // How far the net hangs down

  // Create points for the net
  const netPoints = [];
  for (let i = 0; i < netSegments; i++) {
    const angle = (i / netSegments) * Math.PI * 2;
    const x = Math.cos(angle) * RIM_RADIUS;
    const z = Math.sin(angle) * RIM_RADIUS;

    netPoints.push(new THREE.Vector3(x, HOOP_HEIGHT, RIM_OFFSET + z));
    netPoints.push(new THREE.Vector3(x * 0.5, HOOP_HEIGHT - netDepth, RIM_OFFSET + z * 0.5));
  }

  const netGeometry = new THREE.BufferGeometry().setFromPoints(netPoints);
  const net = new THREE.LineSegments(netGeometry, netMaterial);
  hoopGroup.add(net);

  // 4. Support structure (pole and arms) correctly positioned behind the backboard
  // Pole
  const poleGeometry = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 32);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Gray
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  
  // Position pole behind backboard
  pole.position.set(0, POLE_HEIGHT / 2, -BACKBOARD_WIDTH / 2);
  
  pole.castShadow = true;
  pole.receiveShadow = true;
  hoopGroup.add(pole);

  // Support Arms (from pole to backboard)
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Gray for arms
  const arm1Geometry = new THREE.BoxGeometry(0.1, SUPPORT_ARM_LENGTH, 0.1);

  // First arm
  const arm1 = new THREE.Mesh(arm1Geometry, armMaterial);
  arm1.rotation.z = degrees_to_radians(45); // Angle the arm
  
  // Second arm
  const arm2 = new THREE.Mesh(arm1Geometry, armMaterial);
  arm2.rotation.z = degrees_to_radians(-45); // Angle the arm
  
  arm1.position.set(0, HOOP_HEIGHT + BACKBOARD_HEIGHT / 2 + 0.2, -BACKBOARD_WIDTH / 2 + 0.2);
  arm2.position.set(0, HOOP_HEIGHT + BACKBOARD_HEIGHT / 2 - 0.2, -BACKBOARD_WIDTH / 2 + 0.2);
  
  arm1.castShadow = true;
  arm1.receiveShadow = true;
  arm2.castShadow = true;
  arm2.receiveShadow = true;
  
  hoopGroup.add(arm1);
  hoopGroup.add(arm2);

  hoopGroup.position.set(xPosition, 0, 0);

  hoopGroup.lookAt(new THREE.Vector3(0, HOOP_HEIGHT / 2, 0)); 
  
  scene.add(hoopGroup);
  return hoopGroup;
}


// Create basketball court
function createBasketballCourt() {
  // Court floor - just a simple brown surface
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);

  // Note: All court lines, hoops, and other elements have been removed
  // Students will need to implement these features
}

// Create all elements
createBasketballCourt();
addCourtMarkings();
createBasketballHoop(-13.5); // Left hoop
createBasketballHoop(13.5);    // Right hoop
addBasketball();

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minDistance = 10;
controls.maxDistance = 40;

let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

function addCourtMarkings() {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  // Center Line
  const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.11, -7.5),
    new THREE.Vector3(0, 0.11, 7.5)
  ]);
  const centerLine = new THREE.Line(centerLineGeometry, lineMaterial);
  scene.add(centerLine);

  // Center Circle
  const centerCircleRadius = 1.8;
  const centerCircleShape = new THREE.BufferGeometry();
  const segments = 64;
  const circlePoints = [];

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    circlePoints.push(new THREE.Vector3(
      Math.cos(theta) * centerCircleRadius,
      0.11,
      Math.sin(theta) * centerCircleRadius
    ));
  }

  centerCircleShape.setFromPoints(circlePoints);
  const centerCircle = new THREE.LineLoop(centerCircleShape, lineMaterial);
  scene.add(centerCircle);

  // Three-Point Arcs (left and right)
  const arcRadius = 6.75;
  const arcSegments = 100;
  const arcAngle = Math.PI / 1.3; // narrower arc
  const leftArcPoints = [];
  const rightArcPoints = [];

  for (let i = -arcAngle / 2; i <= arcAngle / 2; i += arcAngle / arcSegments) {
    leftArcPoints.push(new THREE.Vector3(
      Math.cos(-i) * arcRadius - 15,  // left side
      0.11,
      Math.sin(-i) * arcRadius
    ));

    rightArcPoints.push(new THREE.Vector3(
      -Math.cos(i) * arcRadius + 15,  // right side
      0.11,
      Math.sin(i) * arcRadius
    ));
  }

  const leftArcGeometry = new THREE.BufferGeometry().setFromPoints(leftArcPoints);
  const rightArcGeometry = new THREE.BufferGeometry().setFromPoints(rightArcPoints);

  const leftArc = new THREE.Line(leftArcGeometry, lineMaterial);
  const rightArc = new THREE.Line(rightArcGeometry, lineMaterial);

  scene.add(leftArc);
  scene.add(rightArc);
}

function addBasketball() {
  const ballRadius = 0.30;

  // Ball geometry and material
  const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0xff8c00, // Orange
    shininess: 60
  });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.castShadow = true;

  // Position it at center court
  ball.position.set(0, 2.0, 0);
  scene.add(ball);

  // Add black seams (3 circles: equator + 2 longitude)
  const seamMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  const seamSegments = 64;

  // Horizontal seam (equator)
  const equator = new THREE.BufferGeometry();
  const eqPoints = [];
  for (let i = 0; i <= seamSegments; i++) {
    const theta = (i / seamSegments) * 2 * Math.PI;
    eqPoints.push(new THREE.Vector3(
      Math.cos(theta) * ballRadius,
      0,
      Math.sin(theta) * ballRadius
    ));
  }
  equator.setFromPoints(eqPoints);
  const equatorLine = new THREE.LineLoop(equator, seamMaterial);
  ball.add(equatorLine);

  // Vertical seams (longitude)
  for (let angle = 0; angle <= Math.PI; angle += Math.PI) {
    const seam = new THREE.BufferGeometry();
    const seamPoints = [];
    for (let i = 0; i <= seamSegments; i++) {
      const phi = (i / seamSegments) * Math.PI;
      seamPoints.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(angle) * ballRadius,
        Math.cos(phi) * ballRadius,
        Math.sin(phi) * Math.sin(angle) * ballRadius
      ));
    }
    seam.setFromPoints(seamPoints);
    const seamLine = new THREE.Line(seam, seamMaterial);
    ball.add(seamLine);
  }
}


animate();