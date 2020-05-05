/*
 * Group : Boolean Autocrats
 */
window.addEventListener('load', init, false); //load our init() function


// Standard three.js requirements.
var renderer;
var camera;
var scene = new THREE.Scene();


//Model  variables
var mixers = [];
const clock = new THREE.Clock();
const birdModel_PATH = 'model/Stork.glb';
var birdModel;
var loader;

var plane;


//camera variables and parameters variables
var fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;

//light variables

var hemisphereLight, shadowLight;

//sea,sky and cloud variable 
var sea;
var sky;
var cloud




//----------------------------Main function for initialising----------------------------


function init() {

    // set up the scene, the camera and the renderer
    createScene();

    // add the lights
    createLights();

    // add the objects
    createBird();
    createSea();
    createSky();


    //add the listener
    //document.addEventListener('mousemove', handleMouseMove, false);

    //render the scene on each frame
    renderer.setAnimationLoop(() => {

        update();

    });
    render();

}

//-------------------------The Scene ----------------------------------------------

createScene = function() {
    //height and width of the screen
    // for apectRation the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    //camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;

    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    // position of the camera
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

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

    //for handling sccreen resizing
    window.addEventListener('resize', windowResize, false);


}


//------------------------Lights---------------------------------------------



function createLights() {
    //hemisphere light for gradient colored light; 
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)


    // Directional light will act as shadow light 
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    shadowLight.position.set(150, 350, 350);

    // Allowing shadow casting 
    shadowLight.castShadow = true;

    //the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // resolution of the shadow; the higher the better, 
    shadowLight.shadowMapSizeWidth = 2048;
    shadowLight.shadowMapSizeHeight = 2048;

    //  add lights to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);
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

        birdModel.rotation.z = -1.5; //rotating the bird
        birdModel.position.set(-50, 130, -20); // position the bird



        const action = mixer.clipAction(animation); //bird animation
        action.play(); //animation ignited

        //setting shadow of the bird
        birdModel.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });

        scene.add(birdModel);

    };

    // the loader will report the loading progress to this function
    const onProgress = () => {};

    // the loader will send any error messages to this function, and we'll log
    // them to to console
    const onError = (errorMessage) => { console.log(errorMessage); };

    // load the model. The model is loaded asynchronously
    const bird = new THREE.Vector3(0, 0, 0);
    loader.load(birdModel_PATH, gltf => onLoad(gltf, bird), onProgress, onError);




}

//-----------------------Clouds-------------------------------------------------

Cloud = function() {
    // empty container that will hold the different parts of the cloud
    this.mesh = new THREE.Object3D();

    // create a cube geometry;
    // this shape will be duplicated to create the cloud
    var clouadGeometry = new THREE.BoxGeometry(20, 20, 20);


    var cloudMaterial = new THREE.MeshPhongMaterial({
        color: "white",
    });

    // duplicate the geometry a random number of times
    var nBlocks = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nBlocks; i++) {

        cloud = new THREE.Mesh(clouadGeometry, cloudMaterial);

        // set the position and the rotation of each cube randomly
        cloud.position.x = i * 15;
        cloud.position.y = Math.random() * 10;
        cloud.position.z = Math.random() * 10;
        cloud.rotation.z = Math.random() * Math.PI * 2;
        cloud.rotation.y = Math.random() * Math.PI * 2;

        // set the size of the cube randomly
        var s = .1 + Math.random() * .9;
        cloud.scale.set(s, s, s);

        // allow each cube to cast and to receive shadows
        cloud.castShadow = true;
        cloud.receiveShadow = true;

        // add the cube to the container we first created
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
        var h = 750 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself


        //  converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
        cloud.mesh.position.y = Math.sin(a) * h;
        cloud.mesh.position.x = Math.cos(a) * h;

        // rotating the cloud according to its position
        cloud.mesh.rotation.z = a + Math.PI / 2;

        // for a better result, we position the clouds 
        // at random depths inside of the scene
        cloud.mesh.position.z = -400 - Math.random() * 400;

        // we also set a random scale for each cloud
        var s = 1 + Math.random() * 2;
        cloud.mesh.scale.set(s, s, s);

        this.mesh.add(cloud.mesh);
    }
}





function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}


//-------------------------The Sea ------------------------------------------------------------

function Sea() {

    // create the geometry (shape) of the cylinder;
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

    // add to the scene
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

    // create an array to store new data associated to each vertex
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

//----------------------Rendering-----------------------------------------------


function render() {

    // Rotate the sea and the sky
    sea.mesh.rotation.z += .0015;
    sky.mesh.rotation.z += .01;
    sea.moveWaves(); //wave 
    renderer.render(scene, camera);
    // call the loop function again
    requestAnimationFrame(render);
}

//window.onload = init;