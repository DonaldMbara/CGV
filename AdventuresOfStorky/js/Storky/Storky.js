let storky, mixers = [];
//tracks if the bird models is loaded
let storkyIsLoaded = false;

//a Box geometry that covers the storks body
//and follows the storks position
//used for collision detection
let storkyBoxCollider;

//move variables
let mvL = false, mvR = false, mvU = false;

//for gravity effect
let storkyVelocity = new THREE.Vector3(0, 1, 0);
let storkyGravity = new THREE.Vector3(0, -1, 0);
let currentTime = performance.now();

//loads the bird model
function addStorky() {
    //init GLTFLoader, this loads the bird model
    let loader = new THREE.GLTFLoader();
    let onLoad = (gltf, position) => {
        //get reference to bird model
        storky = gltf.scene.children[0];
        storky.position = position;
        //set the bird to look at the front
        storky.lookAt(new THREE.Vector3(0, 1, 0));
        storky.rotation.y = 9.4;

        let animation = gltf.animations[0];
        let mixer = new THREE.AnimationMixer(storky);
        mixers.push(mixer);
        let action = mixer.clipAction(animation);
        action.play();

        storky.traverse(o => {
           if (o.isMesh){
               o.castShadow = true;
               o.receiveShadow = true;
           }
        });
        storky.castShadow = true;

        //init and position the box collider
        let storkyBoxColliderGeo = new THREE.BoxGeometry(0.8, 0.5, 1.2);
        let storkyBoxColliderMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0});
        storkyBoxColliderMat.transparent = true;
        storkyBoxCollider = new THREE.Mesh(storkyBoxColliderGeo, storkyBoxColliderMat);
        storkyBoxCollider.position = storky.position;
        //position the box to accurately fit the stocks body
        //the box collider only covers the body but not the wings
        //because they are animated
        storkyBoxCollider.position.y += 0.2;

        //set the cameras to look @ the birds position
        camera.lookAt(storky.position);
        sideCamera.lookAt(storky.position);

        //add everything into the scene
        scene.add(storky);
        scene.add(storkyBoxCollider);

        //declare the keyboard controls
        //by adding an event listener
        initKeyboardControls();

        storkyIsLoaded = true;
    }
    loader.load("/js/Storky/Stork.glb", gltf => onLoad(gltf, new THREE.Vector3(0, 0, 0)),
        function () {},
        function (e) {
        console.log("failed to load the model with error: " + e);
        });
}

//updates anything related to the bird
function updateBird() {
    //animate the bird
    for (const mixer of mixers) mixer.update(clock.getDelta());
    //apply gravity to the bird
    applyGravityOnStorky();
    //update the birds position
    moveBird();
}

//applies gravity to the bed
//by default the bird will be falling
//until user presses space or w or arrowup button
function applyGravityOnStorky() {
    storkyVelocity.y += storkyGravity.y * 0.1;
    storky.position.y += storkyVelocity.y * 0.1;
}
//add listeners for keyboard press
function initKeyboardControls() {
    //detect when key is pressed
    window.addEventListener('keydown', function (e) {
        //get the key the user pressed
        //and convert it to lowercase
        //in case if the users keyboard
        //has capsLock on
        let keyPressed = e.key.toLowerCase();
        //we only save the state of key press
        //actually update of positions happens in movebird
        if(keyPressed === "a" || keyPressed === "arrowleft") mvL = true;
        if(keyPressed === "d" || keyPressed === "arrowright") mvR = true;
        if (keyPressed === " " || keyPressed === "w") mvU = true;

    });

    //detect when key is no longer pressed
    window.addEventListener('keyup', function (e) {
        let keyPressed = e.key.toLowerCase();

        if(keyPressed === "a" || keyPressed === "arrowleft") mvL = false;
        if(keyPressed === "d" || keyPressed === "arrowright") mvR = false;
        if (keyPressed === " " || keyPressed === "w") mvU = false;

    });
}

//changes the velocity of the bird to go up instead of down
//hence the 1.1 value for y, initially it's 1, the keeps on decreasing
//because of gravity
function pushStorkyUp() {
    storkyVelocity = new THREE.Vector3(0, 1.1, 0);
}

//update the positioning of the bird
function moveBird(){
    if (mvL && storky.position.x >= -21) storky.position.x -= 0.2;
    if (mvR && storky.position.x <= 21) storky.position.x += 0.2;
    if (mvU && storky.position.y <= 6) pushStorkyUp();

    //update the box collider to follow the stork
    storkyBoxCollider.position.x = storky.position.x;
    storkyBoxCollider.position.y = storky.position.y + 0.2;
}
