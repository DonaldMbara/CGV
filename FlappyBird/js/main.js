/*
 * Group : Boolean Autocrats
 */
window.addEventListener('load', init, false);
// Standard three.js requirements.
var renderer;
var camera;
var scene = new THREE.Scene();


//other variables
const birdModel_PATH = 'model/Stork.glb';
var loader = new THREE.GLTFLoader(); // constructor for loading model

var plane;


//camera variables
var fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;

//light variables

var hemisphereLight, shadowLight;

//sea,sky and cloud variable 
var sea;
var sky;
var cloud

const mixers = [];




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
    render();

}

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

var hemisphereLight, shadowLight;

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




createBird = function() {


    loader.load(
        birdModel_PATH,
        function(gltf) {
            // ]
            model = gltf.scene;
            let fileAnimations = gltf.animations;
            model.traverse(o => {
                if (o.isMesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });
            // Set the models initial scale
            model.position.y = 100;
            // Set the models initial scale
            model.scale.set(7, 7, 7);

            scene.add(model);
        },
        undefined, // We don't need this function
        function(error) {
            console.error(error);
        }
    );
}

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
        var c = new Cloud();

        // set the rotation and the position of each cloud;
        var a = stepAngle * i; // this is the final angle of the cloud
        var h = 750 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself


        //  converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;

        // rotating the cloud according to its position
        c.mesh.rotation.z = a + Math.PI / 2;

        // for a better result, we position the clouds 
        // at random depths inside of the scene
        c.mesh.position.z = -400 - Math.random() * 400;

        // we also set a random scale for each cloud
        var s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);

        this.mesh.add(c.mesh);
    }
}

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen



function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}


function windowResize() {
    // update height and width of the renderer and the camera
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}


function render() {

    // Rotate the sea and the sky
    sea.mesh.rotation.z += .005;
    sky.mesh.rotation.z += .01;
    renderer.render(scene, camera);
    // call the loop function again
    requestAnimationFrame(render);
}

//window.onload = init;