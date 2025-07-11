// === COURT CONSTANTS ===
const COURT_HALF_LENGTH = 15; 
const COURT_HALF_WIDTH = 7.5
const BASELINE_OFFSET = 1.2; 
const LEFT_HOOP_X = -(COURT_HALF_LENGTH - BASELINE_OFFSET); 
const RIGHT_HOOP_X = (COURT_HALF_LENGTH - BASELINE_OFFSET);  
const HOOP_HEIGHT = 3.05;   
const POLE_HEIGHT = HOOP_HEIGHT + 1.5; 


export function createBleachers(scene) {
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