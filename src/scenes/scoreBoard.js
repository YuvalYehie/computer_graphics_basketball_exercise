// === COURT CONSTANTS ===
const COURT_HALF_LENGTH = 15; 
const COURT_HALF_WIDTH = 7.5
const BASELINE_OFFSET = 1.2; 
const LEFT_HOOP_X = -(COURT_HALF_LENGTH - BASELINE_OFFSET); 
const RIGHT_HOOP_X = (COURT_HALF_LENGTH - BASELINE_OFFSET);  
const HOOP_HEIGHT = 3.05;   
const POLE_HEIGHT = HOOP_HEIGHT + 1.5; 


export function createScoreboard(scene) {
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