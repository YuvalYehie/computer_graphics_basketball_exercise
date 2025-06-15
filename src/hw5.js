import {OrbitControls} from './OrbitControls.js'

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

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// === MOVE HOOP CONSTANTS AND FUNCTION DEFINITION HERE ===
const HOOP_HEIGHT = 3.05; 
const BACKBOARD_WIDTH = 2.4;
const BACKBOARD_HEIGHT = 1.5;
const RIM_RADIUS = 0.4; 
const POLE_HEIGHT = HOOP_HEIGHT + 1.5; 
const POLE_RADIUS = 0.1;
const SUPPORT_ARM_LENGTH = 1.0;

// === COURT CONSTANTS ===
const COURT_HALF_LENGTH = 15; 
const COURT_HALF_WIDTH = 7.5
const BASELINE_OFFSET = 1.2; 
const LEFT_HOOP_X = -(COURT_HALF_LENGTH - BASELINE_OFFSET); 
const RIGHT_HOOP_X = (COURT_HALF_LENGTH - BASELINE_OFFSET);    

// Function to create a single basketball hoop
function createBasketballHoop(xPosition) {
  const hoopGroup = new THREE.Group();
  
  // Determine if this is the right side hoop
  const isRightSide = xPosition > 0;
  
  // 1. Backboard 
  const backboardGeometry = new THREE.BoxGeometry(BACKBOARD_WIDTH, BACKBOARD_HEIGHT, 0.05);
  const backboardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff, 
    transparent: true,
    opacity: 1.0, 
    shininess: 100
  });

 const backboardTextureLoader = new THREE.TextureLoader();
  backboardTextureLoader.load('./src/images/backboard_logo.jpeg', 
      function(loadedTexture) {
          backboardMaterial.map = loadedTexture;
          backboardMaterial.needsUpdate = true;
          console.log('Backboard texture loaded successfully!');
      },
      undefined, 
      function(err) {
          console.error('An error happened loading the backboard texture:', err);
          // Fallback to a different color or pattern if texture fails
          backboardMaterial.color.set(0xcccccc); 
          backboardMaterial.needsUpdate = true;
          console.log('Using fallback color for backboard due to texture loading error.');
      }
  );

  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  
  // Position backboard
  const RIM_OFFSET = -0.45; 
  backboard.position.set(0, HOOP_HEIGHT + 0.2, -0.9);
  
  backboard.castShadow = true;
  backboard.receiveShadow = true;
  hoopGroup.add(backboard);

  // 2. Rim (orange) 
  const rimGeometry = new THREE.TorusGeometry(RIM_RADIUS, 0.04, 16, 64);
  const rimMaterial = new THREE.MeshPhongMaterial({
    color: 0xff4500, 
    shininess: 80
  });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = Math.PI / 2; 
  
  // Position rim in front of backboard
  rim.position.set(0, HOOP_HEIGHT, RIM_OFFSET);
  
  rim.castShadow = true;
  hoopGroup.add(rim);

  // 3. Chain Net Implementation
  const netMaterial = new THREE.MeshPhongMaterial({
      color: 0xc0c0c0, // Silver-grey for metal chains
      shininess: 200,
      specular: 0xffffff 
  });

  const netDepth = 0.7; 
  const numVerticalStrands = 24; 
  const numHorizontalRings = 5; 

  // Vertical strands (thin cylinders)
  for (let i = 0; i < numVerticalStrands; i++) {
      const angle = (i / numVerticalStrands) * Math.PI * 2;
      const x_start = rim.position.x + Math.cos(angle) * RIM_RADIUS;
      const z_start = rim.position.z + Math.sin(angle) * RIM_RADIUS;

      const strandGeometry = new THREE.CylinderGeometry(0.01, 0.005, netDepth, 8);
      const strand = new THREE.Mesh(strandGeometry, netMaterial);
      strand.position.set(x_start, HOOP_HEIGHT - netDepth / 2, z_start);
      strand.castShadow = true;
      strand.receiveShadow = true;
      hoopGroup.add(strand);
  }

  // Horizontal rings
  for (let i = 1; i <= numHorizontalRings; i++) {
      const y_position = HOOP_HEIGHT - (netDepth / numHorizontalRings) * i;
      const currentRadius = RIM_RADIUS * (1 - (i / numHorizontalRings) * 0.3); 

      const ringGeometry = new THREE.TorusGeometry(currentRadius, 0.01, 8, 32);
      const ring = new THREE.Mesh(ringGeometry, netMaterial);
      ring.rotation.x = Math.PI / 2; 
      ring.position.set(rim.position.x, y_position, rim.position.z);
      ring.castShadow = true;
      ring.receiveShadow = true;
      hoopGroup.add(ring);
  }

  // 4. Support structure (pole and arms) 
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
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 }); 
  const arm1Geometry = new THREE.BoxGeometry(0.1, SUPPORT_ARM_LENGTH, 0.1);

  // First arm
  const arm1 = new THREE.Mesh(arm1Geometry, armMaterial);
  arm1.rotation.z = degrees_to_radians(45); 
  
  // Second arm
  const arm2 = new THREE.Mesh(arm1Geometry, armMaterial);
  arm2.rotation.z = degrees_to_radians(-45); 
  
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
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({
    color: 0xc68642,  // Fallback brown wood color
    shininess: 50
  });

  const textureLoader = new THREE.TextureLoader();
  const woodTexture = textureLoader.load('./src/images/wood_texture.jpg',
    function(loadedTexture) { 
      loadedTexture.wrapS = THREE.RepeatWrapping;
      loadedTexture.wrapT = THREE.RepeatWrapping;
      loadedTexture.repeat.set(5, 5); 
      courtMaterial.map = loadedTexture; 
      courtMaterial.needsUpdate = true; 
      console.log('Wood texture loaded successfully!');
    },
    undefined, 
    function (err) {
      console.error('An error happened loading the wood texture:', err);
      courtMaterial.color.set(0xc68642);
      courtMaterial.needsUpdate = true; 
      console.log('Using fallback color for court due to texture loading error.');
    }
  );

  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
}

// Function to create bleacher sections
function createBleachers() {
    const bleacherGroup = new THREE.Group();
    const bleacherMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 }); 
    const numRows = 4;
    const rowHeight = 0.5; 
    const rowDepth = 1.0;  
    const bleacherLength = COURT_HALF_LENGTH * 2 + 5; 
    for (let i = 0; i < numRows; i++) {
        const rowGeometry = new THREE.BoxGeometry(bleacherLength, rowHeight, rowDepth);
        const row = new THREE.Mesh(rowGeometry, bleacherMaterial);
        row.position.set(
            0,
            (i * rowHeight) + rowHeight / 2 + 0.1, 
            COURT_HALF_WIDTH + (i * rowDepth) + rowDepth / 2 + 1
        );
        row.castShadow = true;
        row.receiveShadow = true;
        bleacherGroup.add(row);
    }
    for (let i = 0; i < numRows; i++) {
        const rowGeometry = new THREE.BoxGeometry(bleacherLength, rowHeight, rowDepth);
        const row = new THREE.Mesh(rowGeometry, bleacherMaterial);
        row.position.set(
            0,
            (i * rowHeight) + rowHeight / 2 + 0.1,
            -(COURT_HALF_WIDTH + (i * rowDepth) + rowDepth / 2 + 1)
        );
        row.castShadow = true;
        row.receiveShadow = true;
        bleacherGroup.add(row);
    }
    const endBleacherWidth = COURT_HALF_WIDTH * 2 + 5;
    const endBleacherDepth = 0.8;
    const numEndRows = 3;
    // Behind left hoop
    for (let i = 0; i < numEndRows; i++) {
        const rowGeometry = new THREE.BoxGeometry(endBleacherDepth, rowHeight, endBleacherWidth);
        const row = new THREE.Mesh(rowGeometry, bleacherMaterial);
        row.position.set(
            -COURT_HALF_LENGTH - (i * endBleacherDepth) - endBleacherDepth / 2 - 1, 
            (i * rowHeight) + rowHeight / 2 + 0.1,
            0
        );
        row.castShadow = true;
        row.receiveShadow = true;
        bleacherGroup.add(row);
    }
    // Behind right hoop
    for (let i = 0; i < numEndRows; i++) {
        const rowGeometry = new THREE.BoxGeometry(endBleacherDepth, rowHeight, endBleacherWidth);
        const row = new THREE.Mesh(rowGeometry, bleacherMaterial);
        row.position.set(
            COURT_HALF_LENGTH + (i * endBleacherDepth) + endBleacherDepth / 2 + 1, 
            (i * rowHeight) + rowHeight / 2 + 0.1,
            0
        );
        row.castShadow = true;
        row.receiveShadow = true;
        bleacherGroup.add(row);
    }
    scene.add(bleacherGroup);
}

// Function to create a scoreboard
function createScoreboard() {
    const scoreboardGroup = new THREE.Group();
    const boardWidth = 10;
    const boardHeight = 5;
    const boardThickness = 0.2;
    const boardMaterial = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 10 });
    // Main board
    const mainBoardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardThickness);
    const mainBoard = new THREE.Mesh(mainBoardGeometry, boardMaterial);
    mainBoard.position.set(0, boardHeight / 2, 0); 
    mainBoard.castShadow = true;
    mainBoard.receiveShadow = true;
    scoreboardGroup.add(mainBoard);
    // Screen display 
    const screenWidth = boardWidth * 0.9;
    const screenHeight = boardHeight * 0.7;
    const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, boardThickness * 0.5);
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); 
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, boardHeight * 0.05, -boardThickness * 0.5); 
    scoreboardGroup.add(screen);

    // Scoreboard Logo
    const logoTextureLoader = new THREE.TextureLoader();
    const logoPlaneWidth = boardWidth * 0.6; 
    const logoPlaneHeight = boardHeight * 0.8; 
    logoTextureLoader.load('./src/images/scoreboard_logo.jpeg', 
        function(logoTexture) {
            const logoMaterial = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
            const logoGeometry = new THREE.PlaneGeometry(logoPlaneWidth, logoPlaneHeight);
            const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
            logoMesh.position.set(0, boardHeight * 0.8, -boardThickness / 2 - 0.01);
            logoMesh.rotation.y = Math.PI; 
            scoreboardGroup.add(logoMesh);
            console.log('Scoreboard logo loaded successfully!');
        },
        undefined, 
        function(err) {
            console.error('An error happened loading the scoreboard logo:', err);
        }
    );

    // Support poles 
    const poleRadius = 0.15;
    const poleHeight = 12; 
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const pole1Geometry = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 32);
    const pole1 = new THREE.Mesh(pole1Geometry, poleMaterial);
    pole1.position.set(-boardWidth / 3, poleHeight / 2, 0); 
    pole1.castShadow = true;
    pole1.receiveShadow = true;
    scoreboardGroup.add(pole1);
    const pole2 = new THREE.Mesh(pole1Geometry, poleMaterial); 
    pole2.position.set(boardWidth / 3, poleHeight / 2, 0); 
    pole2.castShadow = true;
    pole2.receiveShadow = true;
    scoreboardGroup.add(pole2);
    // Position the entire scoreboard group
    scoreboardGroup.position.set(0, POLE_HEIGHT + 2, -COURT_HALF_WIDTH - 6); 
    scoreboardGroup.rotation.y = Math.PI;
    scene.add(scoreboardGroup);
}

// Create all elements
createBasketballCourt();
addCourtMarkings();
createBasketballHoop(-13.5);
createBasketballHoop(13.5);    
addBasketball();
createBleachers();
createScoreboard();

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

  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

function addCourtMarkings() {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  // Outer Court Lines (Baselines and Sidelines)
  // Baselines
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, -COURT_HALF_WIDTH),
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, COURT_HALF_WIDTH)
  ]), lineMaterial));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, -COURT_HALF_WIDTH),
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, COURT_HALF_WIDTH)
  ]), lineMaterial));

  // Sidelines
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, -COURT_HALF_WIDTH),
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, -COURT_HALF_WIDTH)
  ]), lineMaterial));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, COURT_HALF_WIDTH),
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, COURT_HALF_WIDTH)
  ]), lineMaterial));

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
  const threePointLineStraightZ = COURT_HALF_WIDTH - 3; 
  const arcSegments = 100;
  const arcAngle = Math.PI / 1.3; 
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

 // Key / Paint Area (Free Throw Lane)
  const paintWidth = 4.9; 
  const paintLength = 5.8;
  const freeThrowCircleRadius = 1.8; 

  // Left Key
  const leftFreeThrowLineX = -COURT_HALF_LENGTH + paintLength; 

  const leftKeyPoints = [
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, -paintWidth / 2),
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, paintWidth / 2),
    new THREE.Vector3(leftFreeThrowLineX, 0.11, paintWidth / 2),
    new THREE.Vector3(leftFreeThrowLineX, 0.11, -paintWidth / 2),
    new THREE.Vector3(-COURT_HALF_LENGTH, 0.11, -paintWidth / 2) 
  ];
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftKeyPoints), lineMaterial));

  // Right Key 
  const rightFreeThrowLineX = COURT_HALF_LENGTH - paintLength; 

  const rightKeyPoints = [
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, -paintWidth / 2),
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, paintWidth / 2),
    new THREE.Vector3(rightFreeThrowLineX, 0.11, paintWidth / 2),
    new THREE.Vector3(rightFreeThrowLineX, 0.11, -paintWidth / 2),
    new THREE.Vector3(COURT_HALF_LENGTH, 0.11, -paintWidth / 2) 
  ];
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightKeyPoints), lineMaterial));

  // Free Throw Arcs (upper part of the circle)
  const freeThrowArcSegments = 60;

  // Left Free Throw Arc (centered on the free throw line at Z=0)
  const leftFTArcPoints = [];
  for (let i = 0; i <= freeThrowArcSegments; i++) {
    const theta = (i / freeThrowArcSegments) * Math.PI; 
    leftFTArcPoints.push(new THREE.Vector3(
      leftFreeThrowLineX, 
      0.11,
      Math.cos(theta) * freeThrowCircleRadius 
    ));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftFTArcPoints), lineMaterial));


  // Right Free Throw Arc 
  const rightFTArcPoints = [];
  for (let i = 0; i <= freeThrowArcSegments; i++) {
    const theta = (i / freeThrowArcSegments) * Math.PI; 
    rightFTArcPoints.push(new THREE.Vector3(
      rightFreeThrowLineX, 
      0.11,
      Math.cos(theta) * freeThrowCircleRadius 
    ));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightFTArcPoints), lineMaterial));

  const noChargeRadius = 1.25; 
  const noChargeSegments = 30;

  const leftNoChargeArcPoints = [];
  for (let i = -Math.PI / 2; i <= Math.PI / 2; i += Math.PI / noChargeSegments) {
    leftNoChargeArcPoints.push(new THREE.Vector3(
      LEFT_HOOP_X + Math.cos(i) * noChargeRadius, 
      0.11,
      Math.sin(i) * noChargeRadius
    ));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftNoChargeArcPoints), lineMaterial));

  const rightNoChargeArcPoints = [];
  for (let i = -Math.PI / 2; i <= Math.PI / 2; i += Math.PI / noChargeSegments) { 
    rightNoChargeArcPoints.push(new THREE.Vector3(
      RIGHT_HOOP_X - Math.cos(i) * noChargeRadius,
      0.11,
      Math.sin(i) * noChargeRadius 
    ));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightNoChargeArcPoints), lineMaterial));
}

function addBasketball() {

  const ballRadius = 0.30;
  // Ball geometry and material
  const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);  	
  const textureLoader = new THREE.TextureLoader();
  const basketballTexture = textureLoader.load('./src/images/basketball_texture.jpg',
    undefined, 
    undefined, 
    function (err) {
      console.error('An error happened loading the basketball texture:', err);
      // Fallback to solid color if texture fails
      basketballMaterial.color.set(0xff8c00);
    }
  );

  const ballMaterial = new THREE.MeshPhongMaterial({
    map: basketballTexture,
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