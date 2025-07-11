import { degrees_to_radians } from "../scenes/basketBallHoop.js";
import { updatePowerIndicator } from "../hw5.js";
import { recordShotAttempt, resetScore, getScore } from "./scoreSystem.js";
import timeChallenge from './timeChallenge.js';

// === COURT CONSTANTS ===
const COURT_HALF_LENGTH = 15; 
const HOOP_HEIGHT = 3.05; 
const BASELINE_OFFSET = 1.2; 
const LEFT_HOOP_X = -(COURT_HALF_LENGTH - BASELINE_OFFSET); 
const RIGHT_HOOP_X = (COURT_HALF_LENGTH - BASELINE_OFFSET);  
const minPower = 0.0;
const maxPower = 1.0;
const powerStep = 0.05; 

const BALL_RADIUS = 0.3;
const COURT_HEIGHT = 0;

let isOrbitEnabled = true;

let hasFirstShotBeenTaken = false;

export function getOrbitEnabled() {
  return isOrbitEnabled;
}

export function getHasFirstShotBeenTaken() {
  return hasFirstShotBeenTaken;
}

export function setFirstShotTaken() {
  hasFirstShotBeenTaken = true;
}

export function handleArrowKeys(event, basketball, ballVelocity, camera, ballSpeed) {
  if (!basketball) return;

  const cameraDirection = new THREE.Vector3();
  // Make sure movement is relative to camera POV
  camera.getWorldDirection(cameraDirection);
  const cameraRight = new THREE.Vector3().crossVectors(cameraDirection, camera.up).normalize();
  const cameraForward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
  const inputVector = new THREE.Vector3();

  switch (event.key) {
    case "ArrowLeft":
      inputVector.copy(cameraRight).multiplyScalar(-ballSpeed);
      break;
    case "ArrowRight":
      inputVector.copy(cameraRight).multiplyScalar(ballSpeed);
      break;
    case "ArrowUp":
      inputVector.copy(cameraForward).multiplyScalar(ballSpeed);
      break;
    case "ArrowDown":
      inputVector.copy(cameraForward).multiplyScalar(-ballSpeed);
      break;
    default:
      return; 
  }

  ballVelocity.add(inputVector); 
}

export function handleAllKeys(event, basketball, ballVelocity, gravity, shotPower, isBallLaunched, camera, ballSpeed) {
  handleArrowKeys(event, basketball, ballVelocity, camera, ballSpeed);
  
  if (event.key === "o" || event.key === "O") {
    isOrbitEnabled = !isOrbitEnabled;
    console.log("Orbit control:", isOrbitEnabled ? "enabled" : "disabled");
  }

  if (event.key === "w" || event.key === "W") {
    shotPower.value = Math.min(shotPower.value + powerStep, maxPower);
    updatePowerIndicator();
  }

  if (event.key === "s" || event.key === "S") {
    shotPower.value = Math.max(shotPower.value - powerStep, minPower);
    updatePowerIndicator();
  }

  if (event.key === "r" || event.key === "R") {
    resetGame(basketball, ballVelocity, shotPower, isBallLaunched);
  }

  if (event.key === "t" || event.key === "T") {
    timeChallenge.startChallenge(getScore());
  }

  if (event.code === "Space") {
    shootTowardHoop(basketball, ballVelocity, gravity, shotPower.value, isBallLaunched);
  }
}

//export function handleKeyDown(e, basketball, ballVelocity, gravity, shotPower, isBallLaunched) {
//  console.warn("handleKeyDown is deprecated, use handleAllKeys instead");
//}

export function shootTowardHoop(basketball, ballVelocity, gravity, shotPower, isBallLaunched) {
  if (!basketball) return;

  const BALL_RADIUS = 0.3;
  const COURT_HEIGHT = 0;
  
  const isInAir = basketball.position.y > COURT_HEIGHT + BALL_RADIUS + 0.3 || ballVelocity.y > 0.1;
  
  if (isInAir) {
    console.log("Ball is in the air. Cannot shoot while airborne.");
    return;
  }

  const ballPos = basketball.position.clone();
  const leftHoop = new THREE.Vector3(LEFT_HOOP_X, HOOP_HEIGHT, 0);
  const rightHoop = new THREE.Vector3(RIGHT_HOOP_X, HOOP_HEIGHT, 0);

  const targetHoop = (ballPos.distanceTo(leftHoop) < ballPos.distanceTo(rightHoop)) ? leftHoop : rightHoop;

  // === Prevent shooting if already under the hoop and nearly at rest ===
  const isUnderHoop = ballPos.distanceTo(targetHoop) < 1.5;
  const isLow = Math.abs(ballPos.y - 0.3) < 0.2;
  const isStationary = ballVelocity.length() < 0.05;

  if (isUnderHoop && isLow && isStationary) {
    console.log("Ball is already under hoop and settled. Not launching.");
    return;
  }

  const toHoop = new THREE.Vector3().subVectors(targetHoop, ballPos);
  toHoop.y = 0; 
  const horizontalDistance = toHoop.length();
  const verticalDistance = targetHoop.y - ballPos.y;
  const angle = degrees_to_radians(45); 
  const g = Math.abs(gravity.y);

  const denominator = 2 * (horizontalDistance * Math.tan(angle) - verticalDistance);
  if (denominator <= 0 || horizontalDistance === 0) {
    console.warn("Invalid launch condition: skipping shoot.");
    return;
  }

  const requiredSpeed = Math.sqrt((g * horizontalDistance * horizontalDistance) / denominator);

  const dir = toHoop.normalize();
  dir.y = Math.tan(angle);
  dir.normalize();

  const strength = THREE.MathUtils.clamp(shotPower * 1.5, 0.8, 2.0); 
  ballVelocity.copy(dir.multiplyScalar(requiredSpeed * strength));

  setFirstShotTaken();

  recordShotAttempt();
  isBallLaunched.value = true;
}

export function resetGame(basketball, ballVelocity, shotPower, isBallLaunched) {
  // Reset ball position to center
  if (basketball) {
    basketball.position.set(0, COURT_HEIGHT + BALL_RADIUS, 0);
    basketball.rotation.set(0, 0, 0); // Reset ball rotation
  }
  
  ballVelocity.set(0, 0, 0);
  
  shotPower.value = 0.5;
  updatePowerIndicator();
  
  isBallLaunched.value = false;
  
  resetScore();
  
  console.log("Game reset!");
}
