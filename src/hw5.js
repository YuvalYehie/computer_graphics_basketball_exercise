import { OrbitControls } from './OrbitControls.js'
import { createBasketballCourt, addCourtMarkings } from './scenes/basketBallCourt.js';
import { createBasketballHoop } from './scenes/basketBallHoop.js';
import { createBleachers } from './scenes/bleachers.js';
import { createScoreboard } from './scenes/scoreBoard.js';
import { handleAllKeys, getOrbitEnabled, getHasFirstShotBeenTaken } from './controls/buttonControls.js';
import { addBasketball } from './scenes/basketball.js';
import { updateScore, resetScore, getScore } from './controls/scoreSystem.js';
import { handleGroundBounce, handleWallBounces, handleBackboardBounces, applyAirResistance, BALL_RADIUS, COURT_HEIGHT, MIN_BOUNCE_VELOCITY } from './physics/ballPhysics.js';
import BallTrail from './effects/ballTrail.js';
import timeChallenge from './controls/timeChallenge.js';
console.log("HW5 script is running and updated");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// --- ENHANCED LIGHTING SETUP ---
// 1. Ambient Light 
const ambientLight = new THREE.AmbientLight(0x404040, 0.6); 
scene.add(ambientLight);

// 2. Main Directional Light (Sun-like or primary stadium overhead)
const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
mainDirectionalLight.position.set(15, 30, 20); 
mainDirectionalLight.target.position.set(0, 0, 0); 
scene.add(mainDirectionalLight);
scene.add(mainDirectionalLight.target); 

mainDirectionalLight.castShadow = true;
mainDirectionalLight.shadow.mapSize.width = 2048; 
mainDirectionalLight.shadow.mapSize.height = 2048;
mainDirectionalLight.shadow.camera.near = 1;
mainDirectionalLight.shadow.camera.far = 80;
mainDirectionalLight.shadow.camera.left = -30;
mainDirectionalLight.shadow.camera.right = 30;
mainDirectionalLight.shadow.camera.top = 30;
mainDirectionalLight.shadow.camera.bottom = -30;

// 3. SpotLight (Simulating an overhead stadium light)
const spotLight = new THREE.SpotLight(0xffffff, 1.2); 
spotLight.position.set(0, 40, 0);
spotLight.target.position.set(0, 0, 0); 
spotLight.angle = Math.PI / 8; 
spotLight.penumbra = 0.5; 
spotLight.decay = 1; 
spotLight.distance = 100; 

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048; 
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 10;
spotLight.shadow.camera.far = 60; 
spotLight.shadow.camera.fov = 40; 

scene.add(spotLight);
scene.add(spotLight.target); 

// 4. Another Directional Light (Fill light from opposite side)
const fillDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.3); 
fillDirectionalLight.position.set(-15, 10, -10); 
fillDirectionalLight.castShadow = false; 
scene.add(fillDirectionalLight);

// Enable shadows for the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 


// === BALL PHYSICS CONSTANTS ===
const gravity = new THREE.Vector3(0, -0.05, 0);
let isBallLaunched = { value: true }; 
// === PowerBar variables ===
let shotPower = { value: 0.5 };

// Create all elements
createBasketballCourt(scene);
addCourtMarkings(scene);
createBasketballHoop(-13.5, scene);
createBasketballHoop(13.5, scene);    
const basketball = addBasketball(scene); 
createBleachers(scene);
createScoreboard(scene);

// Create ball trail effect
const ballTrail = new BallTrail(scene);

// Set up time challenge score getter
timeChallenge.setScoreGetter(getScore);

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

// Ball rotation variables
const ballRotationSpeed = 0.3; 
let previousBallPosition = new THREE.Vector3();

document.addEventListener("keydown", (event) => {
  handleAllKeys(event, basketball, ballVelocity, gravity, shotPower, isBallLaunched, camera, ballSpeed); 
});

// === PowerBar UI + variables ===
const powerBarContainer = document.createElement('div');
powerBarContainer.style.position = 'absolute';
powerBarContainer.style.top = '20px';
powerBarContainer.style.left = '20px';
powerBarContainer.style.width = '200px';
powerBarContainer.style.height = '20px';
powerBarContainer.style.backgroundColor = '#444';
powerBarContainer.style.border = '1px solid #ccc';

const powerBar = document.createElement('div');
powerBar.style.height = '100%';
powerBar.style.width = `${shotPower.value * 100}%`;
powerBar.style.backgroundColor = '#00ff00';
powerBar.style.transition = 'width 0.2s ease-out';

powerBarContainer.appendChild(powerBar);
document.body.appendChild(powerBarContainer);

// === PowerBar Label ===
const powerLabel = document.createElement('div');
powerLabel.style.color = '#fff';
powerLabel.style.marginTop = '5px';
powerLabel.style.fontSize = '14px';
powerLabel.style.textAlign = 'center';
powerLabel.innerText = `Power: ${Math.round(shotPower.value * 100)}%`;
powerBarContainer.appendChild(powerLabel);

export function updatePowerIndicator() {
  powerBar.style.width = `${shotPower.value * 100}%`;
  powerLabel.innerText = `Power: ${Math.round(shotPower.value * 100)}%`;
}

let ballSpeed = 0.3; 
const ballVelocity = new THREE.Vector3(0, 0, 0);
const ballFriction = 0.85; 


function animate() {
  requestAnimationFrame(animate);

  if (basketball) {
    // Store previous position for rotation calculation
    previousBallPosition.copy(basketball.position);
    
    // Apply gravity whenever ball is "in the air"
    const isInAir = basketball.position.y > COURT_HEIGHT + BALL_RADIUS + 0.01;
    
    if (isInAir) {
      ballVelocity.add(gravity);
      
      // Apply air resistance
      applyAirResistance(ballVelocity);
    }
    
    const nextPos = basketball.position.clone().add(ballVelocity);
    
    basketball.position.copy(nextPos);
    
    // Update ball trail - show trail when ball is in the air
    const minTrailHeight = COURT_HEIGHT + BALL_RADIUS + 0.8; 
    const isHighEnoughForTrail = basketball.position.y > minTrailHeight;
    const isInFlight = isBallLaunched.value && isInAir && getHasFirstShotBeenTaken() && isHighEnoughForTrail;
    ballTrail.updateTrail(basketball.position, isInFlight);
    
    // Calculate ball rotation based on movement
    const movementVector = new THREE.Vector3().subVectors(basketball.position, previousBallPosition);
    if (movementVector.length() > 0.001) { 
      const rotationAxis = new THREE.Vector3();
      
      const velocityMagnitude = ballVelocity.length();
      const rotationMultiplier = ballRotationSpeed * velocityMagnitude;
      
      if (Math.abs(movementVector.x) > 0.001 || Math.abs(movementVector.z) > 0.001) {
        const forwardRotation = movementVector.length() * rotationMultiplier;
        basketball.rotateY(forwardRotation);
        
        rotationAxis.set(-movementVector.z, 0, movementVector.x).normalize();
        basketball.rotateOnAxis(rotationAxis, forwardRotation);
      }
      
      if (Math.abs(movementVector.y) > 0.001) {
        const verticalRotation = Math.abs(movementVector.y) * rotationMultiplier * 0.5;
        basketball.rotateX(verticalRotation);
      }
    }
    
    const groundBounced = handleGroundBounce(basketball, ballVelocity);
    
    const wallBounced = handleWallBounces(basketball, ballVelocity);
    
    // Check backboard collisions
    const backboardBounced = handleBackboardBounces(basketball, ballVelocity);

    // === SCORE DETECTION ===
    const hoopYRange = [2.8, 3]; 
    const hoopRadius = 0.4; 
    const hoopXCoords = [-13.5, 13.5]; 
    const hoopZ = 0;

    for (const hoopX of hoopXCoords) {
      const dx = basketball.position.x - hoopX;
      const dz = basketball.position.z - hoopZ;
      const dy = basketball.position.y;

      const isWithinXZ = (dx * dx + dz * dz <= hoopRadius * hoopRadius);
      const isWithinY = (dy >= hoopYRange[0] && dy <= hoopYRange[1]);

      if (isWithinXZ && isWithinY && isBallLaunched.value) {
        updateScore();
        console.log("Score is:", getScore());
        isBallLaunched.value = false;
        break;
      }
    }
    
    // Check if ball has settled on the ground
    const isOnGround = basketball.position.y <= COURT_HEIGHT + BALL_RADIUS + 0.02;
    const hasLowVelocity = ballVelocity.length() < 0.08;
    const hasLowVerticalVelocity = Math.abs(ballVelocity.y) < MIN_BOUNCE_VELOCITY;
    
    if (isOnGround && hasLowVelocity && hasLowVerticalVelocity) {
      // Ball not moving on ground - stop bouncing 
      isBallLaunched.value = false;
      ballVelocity.set(0, 0, 0);
      basketball.position.y = COURT_HEIGHT + BALL_RADIUS;
    }

    if (!isBallLaunched.value && isOnGround && ballVelocity.length() > 0) {
      ballVelocity.x *= ballFriction;
      ballVelocity.z *= ballFriction;
      
      if (ballVelocity.length() > 0.001) {
        const groundVelocity = new THREE.Vector3(ballVelocity.x, 0, ballVelocity.z);
        const groundSpeed = groundVelocity.length();
        const rollingRotation = groundSpeed * ballRotationSpeed * 6.0; 
        
        basketball.rotateY(rollingRotation);
        
        if (groundSpeed > 0.001) {
          const rollingAxis = new THREE.Vector3(-ballVelocity.z, 0, ballVelocity.x).normalize();
          basketball.rotateOnAxis(rollingAxis, rollingRotation);
        }
      }
      
      if (ballVelocity.length() < 0.01) {
        ballVelocity.set(0, 0, 0);
      }
    }
  }

  controls.enabled = getOrbitEnabled();
  controls.update();
  renderer.render(scene, camera);
}

animate();