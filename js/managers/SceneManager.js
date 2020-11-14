//declare global variables
//for scene
let scene, camera, sideCamera, viewPortHeight, viewPortWidth,
    gameRender, sideGameRender, spotLight,
    //tracks the camera state
    //whether its behind or in front of the stork
    chaseStorkyCameraViewActive = true;

//used to pause the game
let gameInPlay = false;

let clock = new THREE.Clock();

//adds FPS tracker on the top left
function addFPSTracker() {
    (function(){
        const script = document.createElement('script');
        script.onload=function(){
            const stats = new Stats();
            document.body.appendChild(stats.dom);
            requestAnimationFrame(function loop(){
                stats.update();
                requestAnimationFrame(loop)});
        };
        script.src='//mrdoob.github.io/stats.js/build/stats.min.js';
        document.head.appendChild(script);})();
}

function buildScene(){

    //displays the frames per seconds tracker on the top left corner
    addFPSTracker();

    //get the height and width of the viewport
    viewPortHeight = window.innerHeight;
    viewPortWidth = window.innerWidth;

    //build the scene
    scene = new THREE.Scene();

    //declare and position the camera
    camera = new THREE.PerspectiveCamera(65, viewPortWidth / viewPortHeight, 5, 1000);
    camera.position.x = 0;
    camera.position.z = 10;
    camera.position.y = 0;

    //side camera, used to display the side view
    //the view is then displayed on the bottom right corner
    sideCamera = new THREE.PerspectiveCamera(90, viewPortWidth / viewPortHeight, 5, 1000);
    sideCamera.position.x = 28;
    sideCamera.position.y = 2;

    //init the main gameRenderer
    gameRender = new THREE.WebGLRenderer({antialias: true});
    gameRender.setSize(viewPortWidth, viewPortHeight);
    gameRender.shadowMap.enabled = true;

    //add game to container
    document.body.appendChild(gameRender.domElement);

    //init the sideGameRenderer, that renders the
    //side view of the game and displays it on the
    //bottom right corner
    sideGameRender = new THREE.WebGLRenderer({antialias: true});
    sideGameRender.setSize(300, 150);
    //the sideCameraViewPort class is what makes it possible
    //for the view to be displayed on the bottom right corner
    sideGameRender.domElement.classList.add("sideCameraViewPort");
    document.body.appendChild(sideGameRender.domElement);

    //set listener for window resize
    window.addEventListener("resize", windowResizeListener, false);

    //add the defaults
    addLighting();
    addStorky();
    addSkyBox();
    initGameKeyboardKeys();
    buildLevel();
}

//declare game keyboard controls
function initGameKeyboardKeys() {
    window.addEventListener('keydown', function (e) {
        let keyPressed = e.key.toLowerCase();
        if (keyPressed === "p") pauseGame();


        //changes the camera of the game
        if (keyPressed === "c") {
            if (chaseStorkyCameraViewActive){
                //camera now in front of storky
                camera.position.z = 1;
                chaseStorkyCameraViewActive = false;
            }
            else{
                //camera behind of storky
                chaseStorkyCameraViewActive = true;
                camera.position.z = 10;
            }
        }

    });
}

//builds the clouds skyBox
function addSkyBox() {
    //dimensions have to be big, since the cube will cover up
    //the section where the game is taking place
    let skyBoxGeometry = new THREE.CubeGeometry(1000, 1000, 1000);
    let skyBoxTexture = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("../images/px.jpg"), side: THREE.DoubleSide, fog: false}),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("../images/nx.jpg"), side: THREE.DoubleSide, fog: false}),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("../images/py.jpg"), side: THREE.DoubleSide, fog: false}),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("../images/ny.jpg"), side: THREE.DoubleSide, fog: false}),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("../images/pz.jpg"), side: THREE.DoubleSide, fog: false}),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("../images/nz.jpg"), side: THREE.DoubleSide, fog: false})
    ];
    let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxTexture);
    scene.add(skyBox);
}

//adds different lights to the scene
function addLighting() {
    //add ambient light
    let light = new THREE.AmbientLight( 0x404040 , 3); // soft white light
    scene.add( light );

    //add spot light
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 1, 10).normalize();
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);

    scene.add(new THREE.SpotLight(spotLight));
}

//resizes game when user resizes the browser window
function windowResizeListener() {
    viewPortHeight = window.innerHeight;
    viewPortWidth = window.innerWidth;
    gameRender.setSize(viewPortWidth, viewPortHeight);
    camera.aspectRatio = viewPortWidth / viewPortHeight;
    camera.updateProjectionMatrix();
}

function updateSpotLight() {
    spotLight.position.x = storky.position.x;
    spotLight.position.y =  storky.position.y + 1;
    spotLight.lookAt(storky.position);
}

//draws the scene
function renderScene() {
    gameRender.render(scene, camera);
    sideGameRender.render(scene, sideCamera);
}

//updates the camera to maintain the same position
//as the bird
function updateCamera() {
    sideCamera.position.y = storky.position.y;
    camera.position.y = storky.position.y;
    camera.position.x = storky.position.x;
}
