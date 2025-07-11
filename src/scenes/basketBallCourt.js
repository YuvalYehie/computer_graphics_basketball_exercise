// === COURT CONSTANTS ===
const COURT_HALF_LENGTH = 15; 
const COURT_HALF_WIDTH = 7.5
const BASELINE_OFFSET = 1.2; 
const LEFT_HOOP_X = -(COURT_HALF_LENGTH - BASELINE_OFFSET); 
const RIGHT_HOOP_X = (COURT_HALF_LENGTH - BASELINE_OFFSET);   

// Create basketball court
export function createBasketballCourt(scene) {
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
  court.name = "floor";
  court.receiveShadow = true;
  scene.add(court);
}

export function addCourtMarkings(scene) {
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
