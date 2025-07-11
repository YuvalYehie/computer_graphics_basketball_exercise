const BALL_RADIUS = 0.3;
const COURT_HEIGHT = 0;
const BOUNCE_DAMPING = 0.5; 
const MIN_BOUNCE_VELOCITY = 0.05; 
const SIDE_BOUNCE_DAMPING = 0.4; 
const GROUND_FRICTION = 0.98; 
const COURT_HALF_LENGTH = 15;
const COURT_HALF_WIDTH = 7.5;
const BASELINE_OFFSET = 1.2;

export function handleGroundBounce(ball, velocity) {
  const ballBottom = ball.position.y - BALL_RADIUS;
  
  if (ballBottom <= COURT_HEIGHT && velocity.y < 0) {
    ball.position.y = COURT_HEIGHT + BALL_RADIUS;
    velocity.y = -velocity.y * BOUNCE_DAMPING; 
    
    velocity.x *= GROUND_FRICTION;
    velocity.z *= GROUND_FRICTION;
    
    if (Math.abs(velocity.y) < MIN_BOUNCE_VELOCITY) {
      velocity.y = 0;
      ball.position.y = COURT_HEIGHT + BALL_RADIUS;
      
      if (velocity.length() < 0.02) {
        velocity.set(0, 0, 0);
      }
    }
    
    return true; 
  }
  return false;
}

export function handleWallBounces(ball, velocity) {
  let bounced = false;
  const courtXLimit = COURT_HALF_LENGTH - 0.5;
  const courtZLimit = COURT_HALF_WIDTH - 0.5;
  
  // Check court boundaries 
  if (ball.position.x + BALL_RADIUS >= courtXLimit) {
    ball.position.x = courtXLimit - BALL_RADIUS;
    velocity.x = -Math.abs(velocity.x) * SIDE_BOUNCE_DAMPING; 
    bounced = true;
  } else if (ball.position.x - BALL_RADIUS <= -courtXLimit) {
    ball.position.x = -courtXLimit + BALL_RADIUS;
    velocity.x = Math.abs(velocity.x) * SIDE_BOUNCE_DAMPING; 
    bounced = true;
  }
  
  if (ball.position.z + BALL_RADIUS >= courtZLimit) {
    ball.position.z = courtZLimit - BALL_RADIUS;
    velocity.z = -Math.abs(velocity.z) * SIDE_BOUNCE_DAMPING;
    bounced = true;
  } else if (ball.position.z - BALL_RADIUS <= -courtZLimit) {
    ball.position.z = -courtZLimit + BALL_RADIUS;
    velocity.z = Math.abs(velocity.z) * SIDE_BOUNCE_DAMPING; 
    bounced = true;
  }
  
  return bounced;
}

export function handleBackboardBounces(ball, velocity) {
  const LEFT_HOOP_X = -(COURT_HALF_LENGTH - BASELINE_OFFSET);
  const RIGHT_HOOP_X = (COURT_HALF_LENGTH - BASELINE_OFFSET);
  const HOOP_HEIGHT = 3.05;
  const BACKBOARD_WIDTH = 2.4;
  const BACKBOARD_HEIGHT = 1.5;
  const BACKBOARD_Z = -0.9; 
  const BACKBOARD_THICKNESS = 0.05;
  
  let bounced = false;
  
  const leftBackboardX = LEFT_HOOP_X;
  const leftBackboardMinY = HOOP_HEIGHT + 0.2 - BACKBOARD_HEIGHT / 2;
  const leftBackboardMaxY = HOOP_HEIGHT + 0.2 + BACKBOARD_HEIGHT / 2;
  const leftBackboardMinZ = BACKBOARD_Z - BACKBOARD_THICKNESS / 2;
  const leftBackboardMaxZ = BACKBOARD_Z + BACKBOARD_THICKNESS / 2;
  
  if (Math.abs(ball.position.x - leftBackboardX) < BACKBOARD_WIDTH / 2 + BALL_RADIUS &&
      ball.position.y >= leftBackboardMinY - BALL_RADIUS &&
      ball.position.y <= leftBackboardMaxY + BALL_RADIUS &&
      ball.position.z >= leftBackboardMinZ - BALL_RADIUS &&
      ball.position.z <= leftBackboardMaxZ + BALL_RADIUS &&
      velocity.z < 0) { 
    
    ball.position.z = leftBackboardMaxZ + BALL_RADIUS;
    velocity.z = -velocity.z * 0.6; 
    velocity.y *= 0.8; 
    bounced = true;
  }
  
  const rightBackboardX = RIGHT_HOOP_X;
  const rightBackboardMinY = HOOP_HEIGHT + 0.2 - BACKBOARD_HEIGHT / 2;
  const rightBackboardMaxY = HOOP_HEIGHT + 0.2 + BACKBOARD_HEIGHT / 2;
  const rightBackboardMinZ = BACKBOARD_Z - BACKBOARD_THICKNESS / 2;
  const rightBackboardMaxZ = BACKBOARD_Z + BACKBOARD_THICKNESS / 2;
  
  if (Math.abs(ball.position.x - rightBackboardX) < BACKBOARD_WIDTH / 2 + BALL_RADIUS &&
      ball.position.y >= rightBackboardMinY - BALL_RADIUS &&
      ball.position.y <= rightBackboardMaxY + BALL_RADIUS &&
      ball.position.z >= rightBackboardMinZ - BALL_RADIUS &&
      ball.position.z <= rightBackboardMaxZ + BALL_RADIUS &&
      velocity.z < 0) { 
    
    ball.position.z = rightBackboardMaxZ + BALL_RADIUS;
    velocity.z = -velocity.z * 0.6; 
    velocity.y *= 0.8; 
    bounced = true;
  }
  
  return bounced;
}

export function applyAirResistance(velocity) {
  if (velocity.length() > 0) {
    const airResistance = 0.995; 
    velocity.multiplyScalar(airResistance);
  }
}

export { BALL_RADIUS, COURT_HEIGHT, MIN_BOUNCE_VELOCITY }; 