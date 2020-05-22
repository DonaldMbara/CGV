/*
 * Group : Boolean Autocrats
 */
window.addEventListener('load', init, false); //load our init() function
// Standard three.js requirements.
var renderer;
var camera;
var control;
var scene = new THREE.Scene();


//Model  variables
var mixers = [];
var clock = new THREE.Clock();
const birdModel_PATH = 'model/Stork.glb';
var birdModel;
var cube; //covers the bird
var loader;
var spearFreq; //number of spears that passed a point
var hitCoin = false; // to check if the box(bird) collided with coin for now
var hitSpear = false; // to check if the bird collided with the spear


// we use this one to reduce the health if the bird is not taking coins
// it increases with level, and gets updated with distance
var tracking = 0;




//collision

//store all mesh which collide with the bird, e.i spear & coin
var collidableMeshList = [];
var collidableMeshListSpear = [];


//bird position
var bird; //bird vector3 position
var birdPositionY, birdPositionX, birdPositionZ;
var birdRotationY, birdRotationX, birdRotationZ;




//camera variables and parameters variables
var fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;

//light variables

var hemisphereLight, shadowLight;

//sea,sky and cloud variable 
var sea;
var sky;
var cloud
var spear;
var rotateSpears;
var coin;
var rotateCoins;
var score = 0;
var distance = 0;
var initHealth = 100;
var gameSpead = .001;
var coinsCollided = 0; //helps with score, should be incremented when our hero collides with a coin
var gameStatus = "play";
var scoreBoard;
var pauseButton;
var replayView;
var health;


/**
 *  This init() function is called when by the onload event when the document has loaded.
 */

function init() {

    // set up the scene, the camera and the renderer
    createScene();

    // add the lights
    createLights();
    createSpears();

    createCoins();
    // add the objects
    createBird();
    box()

    createSea();
    createSky();






    fieldDistance = document.getElementById("distValue");
    fieldGameOver = document.getElementById("gameoverInstructions");
    scoreBoard = document.getElementById("scoreValue");
    replayView = document.getElementById("replayMessage");
    health = document.getElementById("health");




    //add the listener
    document.addEventListener('keydown', doKey, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    //render the scene on each frame
    if (gameStatus == "play") {
        renderer.setAnimationLoop(() => {

            update();

        });
        render();
    } else if (distance == 0) {
        gameStatus = 'waitingReplay';
        //health.style.width = "100%";


        showReplay();

    } else {
        //console.log(gameStatus);
        gameOver();
    }


}

//-------------------------The Scene ----------------------------------------------

createScene = function() {
    //height and width of the screen
    // for apectRation the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    //camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 100;
    nearPlane = 5;
    farPlane = 1010;

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    // position of the camera
    camera.position.x = -250;
    camera.position.z = 0;
    camera.position.y = 150;
    camera.rotation.z = 0;
    camera.rotation.y = 300;

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true, // Allow transparency to show the gradient background
        antialias: true
    });

    //fills the entire screen
    renderer.setSize(WIDTH, HEIGHT);

    // Enable shadow rendering
    renderer.shadowMap.enabled = true;

    // container we created in the HTML
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    //for handling screen resizing
    window.addEventListener('resize', windowResize, false);

    clock = new THREE.Clock();
}


//------------------------Lights---------------------------------------------



function createLights() {
    //hemisphere light for gradient colored light; 
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)


    // Directional light will act as shadow light 
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(-150, 150, 0);

    // Allowing shadow casting 
    shadowLight.castShadow = true;

    //the visible area of the projected shadow
    shadowLight.shadow.camera.left = 400;
    shadowLight.shadow.camera.right = -400;
    shadowLight.shadow.camera.top = -400;
    shadowLight.shadow.camera.bottom = 400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // resolution of the shadow; the higher the better, 
    shadowLight.shadowMapSizeWidth = 2048;
    shadowLight.shadowMapSizeHeight = 2048;

    //  add lights to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);
}


function box() {
    //create a box which will enclose the bird
    var cubeGeometry = new THREE.CubeGeometry(2, .8, 3); //created a cube wiht (w,b,h) =  (4,1,3)
    var cubeMaterial = new THREE.MeshLambertMaterial({ color: "red", transparent: true })
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-100, 100, 0);
    cube.scale.set(5, 5, 5)
    cube.visible = false; //make it invisible, set it to true to see the box
    scene.add(cube)

}



//-------------------------Our Hero(The bird)-------------------------------------------

createBird = function() {

    loader = new THREE.GLTFLoader(); // constructor for loading model


    const onLoad = (gltf, position) => {

        birdModel = gltf.scene.children[0];
        birdModel.position.copy(position);

        const animation = gltf.animations[0];

        const mixer = new THREE.AnimationMixer(birdModel);
        mixers.push(mixer);
        birdModel.scale.set(7, 7, 7); //increase size of the bird by a factor of 7

        birdModel.rotation.z = -1.55; //rotating the bird

        birdPosition = birdModel.position.copy(position);
        birdPositionY = birdModel.position.y;
        birdPositionX = birdModel.position.x;
        birdPositionZ = birdModel.position.z;






        const action = mixer.clipAction(animation); //bird animation
        action.play(); //animation ignited

        //setting shadow of the bird
        birdModel.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;



                //     for (var vertexIndex = 0; vertexIndex < o.geometry.vertices.length; vertexIndex++) {
                //         var localVertex = o.geometry.vertices[vertexIndex].clone();
                //         var globalVertex = localVertex.applyMatrix4(birdModel.matrix);
                //         var directionVector = globalVertex.sub(birdModel.position);
                //         var ray = new THREE.Raycaster(
                //             originPoint, directionVector.clone().normalize());
                //         var collisionResults =
                //             ray.intersectObjects(collidableMeshList);

                //         if (collisionResults.length > 0 &&
                //             collisionResults[0].distance < directionVector.length()) {
                //             console.log("hit");
                //         }
                //     }

            }


        });

        birdModel.name = "bird";
        scene.add(birdModel);

    };

    // the loader will report the loading progress to this function
    const onProgress = () => {};

    // the loader will send any error messages to this function, and we'll log
    // them to to console
    const onError = (errorMessage) => { console.log(errorMessage); };

    // load the model. The model is loaded asynchronously
    bird = new THREE.Vector3(-100, 100, 0);
    loader.load(birdModel_PATH, gltf => onLoad(gltf, bird), onProgress, onError);

    var originPoint = bird; //current posotion of the bird

    //sending rays from center of the bird


}




//-----------------------Clouds-------------------------------------------------

Cloud = function() {
    // empty container that will hold the different parts of the cloud
    this.mesh = new THREE.Object3D();

    const geo = new THREE.Geometry()


    // creating a torus geometry;
    // this shape will be duplicated to create the cloud
    const tuft1 = new THREE.SphereGeometry(15, 10, 8)
    tuft1.translate(-2, 0, 0)
    geo.merge(tuft1)

    const tuft2 = new THREE.SphereGeometry(15, 10, 8)
    tuft2.translate(2, 0, 0)
    geo.merge(tuft2)

    const tuft3 = new THREE.SphereGeometry(20, 10, 8)
    tuft3.translate(0, 0, 0)
    geo.merge(tuft3)


    var cloudMaterial = new THREE.MeshLambertMaterial({
        color: 'white',
        flatShading: true
    });

    // duplicate the geometry a random number of times
    var nBlocks = 4 + Math.floor(Math.random() * 4);
    for (var i = 0; i < nBlocks; i++) {

        cloud = new THREE.Mesh(geo, cloudMaterial);

        // set the position and the rotation of each sphere randomly
        cloud.position.x = i * 15;
        cloud.position.y = Math.random() * 10;
        cloud.position.z = Math.random() * 10;
        cloud.rotation.z = Math.random() * Math.PI * 2;
        cloud.rotation.y = Math.random() * Math.PI * 2;

        // set the size of the cube randomly
        var size = .5 + Math.random() * .6;
        cloud.scale.set(size, size, size);

        // allow each cube to cast and to receive shadows
        cloud.castShadow = true;
        cloud.receiveShadow = true;

        // add the torus to the container we first created
        this.mesh.add(cloud);
    }
}


//-----------------------------------The Sky-----------------------------------------------------

Sky = function() {
    // Create an empty container
    this.mesh = new THREE.Object3D();

    // number of clouds to be scattered in the sky
    this.nClouds = 20;

    // To distribute the clouds consistently,
    // we need to place them according to a uniform angle
    var stepAngle = Math.PI * 2 / this.nClouds;

    // create the clouds
    for (var i = 0; i < this.nClouds; i++) {
        var cloud = new Cloud();

        // set the rotation and the position of each cloud;
        var a = stepAngle * i; // this is the final angle of the cloud
        var h = 850 + 150 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself


        //  converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
        cloud.mesh.position.y = Math.sin(a) * h;
        cloud.mesh.position.x = Math.cos(a) * h;

        // rotating the cloud according to its position
        cloud.mesh.rotation.z = a + Math.PI / 2;

        // for a better result, we position the clouds 
        // at random depths inside of the scene
        cloud.mesh.position.z = 300 - Math.random() * 400;

        // set a random scale for each cloud
        var size = 1 + Math.random() * 2;
        cloud.mesh.scale.set(size, size, size);

        this.mesh.add(cloud.mesh);
    }
}





function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -750;
    scene.add(sky.mesh);
}


//-------------------------The Sea ------------------------------------------------------------

function Sea() {

    // creating the geometry (shape) of the cylinder;
    // the parameters are: 
    // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
    var geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

    // rotate the geometry on the x axis
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // create the material 
    var material = new THREE.MeshPhongMaterial({
        color: "rgb(0,119,190)",
        transparent: true,
        opacity: .6,
        flatShading: THREE.FlatShading,
    });


    this.mesh = new THREE.Mesh(geometry, material);

    // Allow the sea to receive shadows
    this.mesh.receiveShadow = true;
}



function createSea() {
    sea = new Sea();

    // bottom of the scene
    sea.mesh.position.y = -600;
    scene.add(sea.mesh);
}



//-------------------------The Sea Waves ------------------------------------------------------

Sea = function() {
    var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // important: by merging vertices we ensure the continuity of the waves
    geom.mergeVertices();

    // get the vertices
    var l = geom.vertices.length;

    //  an array to store new data associated to each vertex
    this.waves = [];

    for (var i = 0; i < l; i++) {
        // get each vertex
        var v = geom.vertices[i];

        // store some data associated to it
        this.waves.push({
            y: v.y,
            x: v.x,
            z: v.z,
            // a random angle
            ang: Math.random() * Math.PI * 2,
            // a random distance
            amp: 5 + Math.random() * 15,
            // a random speed between 0.016 and 0.048 radians / frame
            speed: 0.016 + Math.random() * 0.032
        });
    };
    var mat = new THREE.MeshPhongMaterial({
        color: "rgb(0,119,190)",
        transparent: true,
        opacity: .8,
        shading: THREE.FlatShading,
    });

    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;

}


Sea.prototype.moveWaves = function() {

    // get the vertices
    var verts = this.mesh.geometry.vertices;
    var l = verts.length;

    for (var i = 0; i < l; i++) {
        var v = verts[i];

        // get the data associated to it
        var vprops = this.waves[i];

        // update the position of the vertex
        v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
        v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

        // increment the angle for the next frame
        vprops.ang += vprops.speed;

    }


    this.mesh.geometry.verticesNeedUpdate = true;

    sea.mesh.rotation.z += .005;
}


//----------------------------window resizing----------------------------------

function windowResize() {
    // update height and width of the renderer and the camera
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}



//---------------bird animation update -------------------------------



function update() {

    const delta = clock.getDelta();

    for (const mixer of mixers) {

        mixer.update(delta);

    }

}

//------------------updating score and distance-----------------------



function updateDistance() {
    distance += gameSpead * 100; //spead of the game converted to distance (d = s*t (100ms))
    var d = distance / 2; //divide distance into units
    fieldDistance.innerHTML = Math.floor(d);
    tracking += .03; // tracks distance and updates 
}

//still fixing collision so that score works



function updateHealth(h) {


    h = Math.ceil(initHealth - tracking); //updates health with distance
    // console.log(h);

    // if (health == "50%") {
    //     document.getElementById("health").style. = "red";

    // }



    if (Math.floor(h) == 0) { //checks if updated health is 0
        gameOver();
        h = 0;
        console.log(h);
        return health.style.width = 100 + "%";
        // game over

    }




    return health.style.width = h + "%"; //we updating the healthbar

}


//----------------------------------gameOver------------------

//not completed
//takes everything to initial stage

function gameOver() {
    fieldGameOver.className = "show";
    score = 0;
    distance = 0;
    initHealth = 100;
    health.style.wid
    gameSpead = 0;
    levelSpeed = 0;
    gameStatus = "gameOver";
    distance = 0;
    showReplay();


}


//--replay

function showReplay() {
    replayMessage.style.display = "block";
}

function hideReplay() {
    replayMessage.style.display = "none";
}


function handleMouseUp(event) {
    if (gameStatus == "gameOver") {
        resetGame();
        hideReplay();
    }
}


function handleTouchEnd(event) {
    if (gameStatus == "gameOver") {
        resetGame();
        hideReplay();
    }
}

//---------------------reset game for restarting---------------------


//takes everything to where it was initially, still buggy

function resetGame() {

    bird = new THREE.Vector3(-100, 100, 0);
    initHealth = 100;
    gameSpead = .001;
    level = 0;
    distance = 0;
    gameStatus = "play";
}


//-----------------------------Enemy-------------------------------


function Spear() {
    this.mesh = new THREE.Object3D();
    var geom = new THREE.CylinderGeometry(3, 0.05, 20, 5);
    var mat = new THREE.MeshPhongMaterial({
        color: "blue",
        shininess: 0,
        specular: 0xffffff,
        shading: THREE.FlatShading
    });


    // duplicate the geometry a random number of times
    spearFreq = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < spearFreq; i++) {
        spear = new THREE.Mesh(geom, mat);



        // allow each cube to cast and to receive shadows
        spear.castShadow = true;
        spear.receiveShadow = true;
        spear.rotation.z = 1.5;

        //random position of the spear
        spear.position.x = -200;
        spear.position.y = 10 + Math.random() * (140);
        spear.position.z = -200 + Math.random() * 200;



        // add the spears to the container we first created
        this.mesh.add(spear);



    }

}



RotateSpears = function() {

    // Create an empty container
    this.mesh = new THREE.Object3D();

    // number of spears to be scattered in the sky
    this.nSpears = 20;

    // To distribute the spears consistently,
    // we need to place them according to a uniform angle
    var stepAngle = Math.PI * 2 / this.nSpears;

    // create the spears
    var _spear;
    for (var i = 0; i < this.nSpears; i++) {
        _spear = new Spear();

        // set the rotation and the position of each spears;
        var a = stepAngle * i; // this is the final angle of the spears
        var h = 600 + 150 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself


        //  converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
        _spear.mesh.position.y = Math.sin(a) * h;
        _spear.mesh.position.x = Math.cos(a) * h;

        // rotating the spears according to its position
        _spear.mesh.rotation.z = a + Math.PI / 1.8;

        // for a better result, we position the spears 
        // at random depths inside of the scene
        _spear.mesh.position.z = -50 + Math.floor(Math.random() * 200);

        // set a random scale for each spears

        collidableMeshListSpear.push(spear);

        this.mesh.add(_spear.mesh);



    }

    // console.log(collidableSpears);
}







function createSpears() {
    rotateSpears = new RotateSpears();

    rotateSpears.mesh.position.y = -700;
    //rotateSpears2.mesh.position.y = -700;

    scene.add(rotateSpears.mesh);
    //scene.add(rotateSpears2.mesh);



}


//-----------------------------------------coins---------------------------

var coins = [];

function Coin() {
    this.mesh = new THREE.Object3D();
    var geom = new THREE.SphereGeometry(4, 4, 2, 2);
    var mat = new THREE.MeshPhongMaterial({
        color: "yellow",
        shininess: 0,
        specular: 0xffffff,
        flatShading: THREE.FlatShading
    });


    coin = new THREE.Mesh(geom, mat);


    // duplicate the geometry a random number of times
    var coinFreq = 3 + Math.floor(Math.random() * 5);
    for (var i = 0; i < coinFreq; i++) {



        // allow each coin to cast and to receive shadows
        coin.castShadow = true;
        coin.receiveShadow = true;

        //random position of the coin
        coin.position.x = 50;





        // add the coins to the container we first created
        this.mesh.add(coin);




    }


}


RotateCoins = function() {

    // Create an empty container
    this.mesh = new THREE.Object3D();

    // number of coin to be scattered in the sky
    this.nCoins = 100;

    // To distribute the coin consistently,
    // we need to place them according to a uniform angle
    var stepAngle = Math.PI * 4 / this.nCoins;

    // create the coins
    for (var i = 0; i < this.nCoins; i++) {
        _coin = new Coin();


        // set the rotation and the position of each coin;
        var a = stepAngle * i; // this is the final angle of the coin
        var h = 500 + 150 + Math.random() * 200; // this is the distance between the center of the axis and the coin itself


        //  converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
        _coin.mesh.position.y = Math.sin(a) * h;
        _coin.mesh.position.x = Math.cos(a) * h;

        // rotating the coin according to its position
        _coin.mesh.rotation.z = a + Math.PI / 1.8;

        // for a better result, we position the coin 
        // at random depths inside of the scene

        _coin.mesh.position.z = 0;

        // set a random scale for each coin

        coins.push(_coin.mesh)
        this.mesh.add(_coin.mesh);

        //coins.pop();

        collidableMeshList.push(coin);
        console.log(_coin.mesh.children);


    }
    //collidableMeshList = this.mesh.children[0].children;



}





function createCoins() {
    rotateCoins = new RotateCoins();

    rotateCoins.mesh.position.y = -700;

    scene.add(rotateCoins.mesh);
}




// waveSound = function() {

//     //add it to the camera


//     // load a sound and set it as the Audio object's buffer
//     var audioLoader = new THREE.AudioLoader();
//     audioLoader.load('sounds/ambient.ogg', function(buffer) {
//         sound.setBuffer(buffer);
//         sound.setLoop(true);
//         sound.setVolume(0.5);
//         sound.play();
//     });
// }

//----------------------------- keyboard support ----------------------------------

/*  Responds to user's key press.  Here, it is used to move the model.
 */
function doKey(event) {
    var code = event.keyCode;




    if (code === 37 && birdModel.position.z > -100) { //put some boundaries for the bird
        //does not have to exceed -40 units z-diration
        //left arrow
        birdModel.position.z -= 1;
        cube.position.z -= 1;
    } else if (code === 39 && birdModel.position.z < 100) { //put some boundaries for the bird
        //does not have to exceed 40 units z-diration
        //right arrow

        birdModel.position.z += 1;
        cube.position.z += 1;



    } else if (code === 38 && birdModel.position.y < 150) { //put some boundaries for the bird
        //does not have to exceed 140 units above y-diration

        //up arrow
        birdModel.position.y += 1;;
        cube.position.y += 1;;



    } else if (code === 40 && birdModel.position.y > 10) { //put some boundaries for the bird
        //does not have to exceed 10 units below y-diration
        //down arrow
        birdModel.position.y -= 1;
        cube.position.y -= 1;



    }



    // switch (code) {
    //     case 37:
    //         //birdModel.rotation.x -= 0.03
    //         break; // left arrow
    //     case 39:
    //         //birdModel.rotation.x += 0.03

    //         break; // right arrow
    //     case 38:
    //         break; // up arrow
    //     case 40:
    //         break; // down arrow
    // }

}

//------------------------------collison-----------------------------------------


function collisionCoin() {

    //console.log(coins);
    //raycasting
    var originPoint = cube.position.clone();
    for (var vertexIndex = 0; vertexIndex < cube.geometry.vertices.length; vertexIndex++) {
        var ray = new THREE.Raycaster(cube.position, cube.geometry.vertices[vertexIndex]);
        var collisionResults = ray.intersectObjects(collidableMeshList); // collidableMeshList is an array of objects(coins for now)
        if (collisionResults.length > 0) {
            hitCoin = true;
            score++;
            console.log('hit coin ' + score);
            scoreBoard.innerHTML = Math.floor(score);
            initHealth += 1


        }
    }
}


function collisionSpear() {

    //console.log(coins);
    //raycasting
    var originPoint = cube.position.clone();
    for (var vertexIndex = 0; vertexIndex < cube.geometry.vertices.length; vertexIndex++) {
        var ray = new THREE.Raycaster(cube.position, cube.geometry.vertices[vertexIndex]);
        var collisionResults = ray.intersectObjects(collidableMeshListSpear); // collidableMeshList is an array of objects(coins for now)
        if (collisionResults.length > 0) {
            hitSpear = true;
            console.log('hit spear');
            initHealth -= 1;



        }
    }
}



//----------------------Rendering-----------------------------------------------
var levelSpeed = 0.00001 //speed of a level after a certain distance is reached, level spead will update


function render() {

    // Rotate the sea,spears and the sky
    sea.mesh.rotation.z += gameSpead;
    sky.mesh.rotation.z += gameSpead;
    rotateSpears.mesh.rotation.z += gameSpead;
    //rotateSpears2.mesh.rotation.z += gameSpead;

    rotateCoins.mesh.rotation.z += gameSpead;


    if (Math.ceil(distance) > 0 && Math.ceil(initHealth != 0)) { //acts as if(!gameOver) for now
        //updateing the speeds
        sea.mesh.rotation.z += gameSpead + levelSpeed;
        sky.mesh.rotation.z += gameSpead + levelSpeed;
        rotateSpears.mesh.rotation.z += gameSpead + levelSpeed;
        //rotateSpears2.mesh.rotation.z += gameSpead;

        rotateCoins.mesh.rotation.z += gameSpead + levelSpeed;
        levelSpeed += .000005; // update levelSpeed

    }
    //console.log(levelSpeed);



    //updating
    sea.moveWaves(); //wave 
    updateDistance();
    updateHealth();
    collisionCoin();
    collisionSpear();


    renderer.render(scene, camera);


    // call the loop function again
    requestAnimationFrame(render);
}