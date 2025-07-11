export function addBasketball(scene) {

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

  // Position it at center court - start in the air and let it fall
  ball.position.set(0, 5.0, 0); // Start 5 units high in the air
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

    return ball;
  }
}