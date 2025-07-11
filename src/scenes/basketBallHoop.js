// === MOVE HOOP CONSTANTS AND FUNCTION DEFINITION HERE ===
const HOOP_HEIGHT = 3.05; 
const BACKBOARD_WIDTH = 2.4;
const BACKBOARD_HEIGHT = 1.5;
const RIM_RADIUS = 0.4; 
const POLE_HEIGHT = HOOP_HEIGHT + 1.5; 
const POLE_RADIUS = 0.1;
const SUPPORT_ARM_LENGTH = 1.0;
 
export function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

export function createBasketballHoop(xPosition, scene) {
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
  rim.name = "hoop";
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