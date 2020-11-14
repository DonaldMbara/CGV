//declare and init texture to be used for environment mapping
let texture = THREE.ImageUtils.loadTextureCube(
    ["../images/px.jpg", "../images/nx.jpg", "../images/py.jpg",
        "../images/ny.jpg", "../images/pz.jpg", "../images/nz.jpg"]
);

//declare and init cylinderGeometry, cylinderMaterial and cylinder mesh object
//for the cylinders used to build the pipes
//reason for declaring the objects global is to create them once
//then clone them to increase performance
let cylinderGeometry = new THREE.CylinderGeometry(5, 5, 40, 32);
let cylinderMaterial = new THREE.MeshLambertMaterial({
    color: 0x16a825,
    envMap:texture});
let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

//declare and init the refractive plane between the top and bottom pipe
let gateGeo = new THREE.PlaneGeometry(10, 10);
let defaultGate = new THREE.Refractor(gateGeo, {
    color: 0x16a825,
    textureWidth: 1024,
    textureHeight: 1024,
    shader: THREE.WaterRefractionShader//add a shadder
});

//declare and init the cube that sits in fronts of the pipe
//and can be moved using mouse drag
let cubeGeometry = new THREE.BoxGeometry(10, 10, 0.2);
let cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x5f8c9e,
    envMap: texture,
    opacity: 0.5,
    flatShading: true
});
let moveableGate = new THREE.Mesh(cubeGeometry, cubeMaterial);

//builds the whole pipe and returns the Object3D
//the function takes in a z to position the pipe
//to the correct z-axis, the z-axis is provided
//when a level is built in LevelManager
function buildPipe(z) {
    let pipe = new THREE.Object3D();

    //builds the bottom cylinder
    let bottomCylinder = cylinder.clone();
    //sets the name of the created cylinder
    //this helps us know what we collided with
    //when checking for collisions inside
    //level manager
    bottomCylinder.name = Obstacle;
    bottomCylinder.castShadow = true;
    bottomCylinder.receiveShadow = true;

    //same approach as bottom cylinder
    //except with this one, we set the y position
    let topCylinder = cylinder.clone();
    topCylinder.name = Obstacle;
    topCylinder.position.y = 45;
    topCylinder.castShadow = true;
    topCylinder.receiveShadow = true;

    //builds the refractive plane between the two cylinders
    //the object has a different name because we want to know
    //if the bird collided with the gate and choose an appropriate
    //action to take
    let gate = defaultGate.clone();
    gate.name = safeGate;
    gate.position.y = 23;

    //same approach as topCylinder
    let moveGate = moveableGate.clone();
    moveGate.name = Obstacle;
    moveGate.position.y = 23;
    moveGate.position.z = 5;//pushes the object to be in front of the pip
    moveGate.castShadow = true;
    moveGate.receiveShadow = true;

    //add the object to moveables list
    //the list carries objects that can be dragged
    //by the mouse
    moveables.push(moveGate);

    //add shadows to the object
    pipe.castShadow = true;
    pipe.receiveShadow = true;

    //add the created objects into the pipe object
    pipe.add(bottomCylinder);
    pipe.add(topCylinder);
    pipe.add(gate);
    pipe.add(moveGate);

    //and then position the pipe
    pipe.position.y = getRandomArbitrary(-35, -16); //randomly position y
    pipe.position.x = getRandomArbitrary(-20, 20); //randomly position x
    pipe.position.z = z;

    return pipe;
}
