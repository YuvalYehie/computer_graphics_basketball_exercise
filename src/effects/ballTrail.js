class BallTrail {
  constructor(scene) {
    this.scene = scene;
    this.trailPoints = [];
    this.maxTrailLength = 20; 
    this.trailMesh = null;
    this.isActive = false;
    
    this.trailMaterial = new THREE.LineBasicMaterial({
      color: 0xff1493, 
      transparent: true,
      opacity: 0.8,
      linewidth: 3
    });
    
    this.initializeTrail();
  }
  
  initializeTrail() {

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxTrailLength * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    

    this.trailMesh = new THREE.Line(geometry, this.trailMaterial);
    this.scene.add(this.trailMesh);
    

    this.trailMesh.visible = false;
  }
  
  startTrail(ballPosition) {
    this.isActive = true;
    this.trailPoints = [];
    this.trailPoints.push(ballPosition.clone());
    this.trailMesh.visible = true;
  }
  
  updateTrail(ballPosition, isInFlight) {
    if (!isInFlight) {
      this.stopTrail();
      return;
    }
    
    if (!this.isActive) {
      this.startTrail(ballPosition);
      return;
    }
    
    this.trailPoints.push(ballPosition.clone());
    
    if (this.trailPoints.length > this.maxTrailLength) {
      this.trailPoints.shift();
    }
    
    this.updateTrailGeometry();
  }
  
  updateTrailGeometry() {
    if (this.trailPoints.length < 2) return;
    
    const positions = this.trailMesh.geometry.attributes.position.array;
    
    positions.fill(0);
    
    for (let i = 0; i < this.trailPoints.length && i < this.maxTrailLength; i++) {
      const point = this.trailPoints[i];
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    this.trailMesh.geometry.setAttribute('position', 
      new THREE.BufferAttribute(positions, 3));
    this.trailMesh.geometry.setDrawRange(0, this.trailPoints.length);
    
    const fadeStrength = Math.min(this.trailPoints.length / this.maxTrailLength, 1.0);
    this.trailMaterial.opacity = 0.8 * fadeStrength;
  }
  
  stopTrail() {
    this.isActive = false;
    this.trailMesh.visible = false;
    this.trailPoints = [];
  }
  
  setTrailColor(color) {
    this.trailMaterial.color.setHex(color);
  }
  
  setTrailLength(length) {
    this.maxTrailLength = Math.max(5, Math.min(50, length));
  }
}

export default BallTrail; 