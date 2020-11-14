let levelObjects = []; //stores all obstacles in game
let moveables = []; //stores all objects that can be dragged by the mouse
let z = -35; //sets the initial z of where all the obstacles will start
let amountOfObstaclesPerLevel = 3;
let pipeCount = 0;//tracks the number of pipes player has passed through
let totalPipesInScene = 0;//tracks the total number of pipes added in scene

//builds the whole game
function buildLevel() {
    buildLevel1();
}

//builds and positions obstacle for level1
//obstacles are randomly positioned at x and y
function buildLevel1() {
    for (let i = 0; i < amountOfObstaclesPerLevel; i++){
        let pipe = buildPipe(z);
        pipe.name = ""; //empty string, obstacle does not move
        scene.add(pipe);
        levelObjects.push(pipe);
        z -= 45;//move inwards into the scene, this allows the next obstacle to be inwards the scene
        totalPipesInScene++;
    }

    //build the following level
    buildLevel2();
}

//similar to above function
function buildLevel2() {
    for (let i = 0; i < amountOfObstaclesPerLevel; i++){
        let pipe = buildPipe(z);
        pipe.name = getRandomHorizontalMovement(); //obstacle moves horizontally
        scene.add(pipe);
        levelObjects.push(pipe);
        z -= 45;
        totalPipesInScene++;
    }

    buildLevel3();
}

//similar to above function
function buildLevel3() {
    for (let i = 0; i < amountOfObstaclesPerLevel; i++){
        let pipe = buildPipe(z);
        pipe.name = getRandomVerticalMovement(); //obstacle moves vertically
        scene.add(pipe);
        levelObjects.push(pipe);
        z -= 45;
        totalPipesInScene++;
    }

    buildLevel4();
}

//similar to above function
//but with this one we also init drag controls
function buildLevel4() {
    for (let i = 0; i < amountOfObstaclesPerLevel; i++){
        let pipe = buildPipe(z);
        pipe.name = getRandomHorizontalVerticalMovement();//some obstacles move horizontally, and some vertically
        scene.add(pipe);
        levelObjects.push(pipe);
        z -= 45;
        totalPipesInScene++;
    }
    //init drag controls
    let controls = new THREE.DragControls(moveables, camera, gameRender.domElement);

    //init the score track tracker
    document.getElementById("pipeCount").innerText = pipeCount.toString() + "/" + totalPipesInScene.toString();
}

//removes all obstacles from scene
function cleanUpScene() {
    //removes obstacles 1 by 1
    while (levelObjects.length > 0){
        for (let j = 0; j < levelObjects[0].children.length; j++) scene.remove(levelObjects[0].children[j]);
        scene.remove(levelObjects[0]);
        levelObjects.shift();
    }

    //empty all the lists
    levelObjects.length = 0;
    moveables.length = 0;

    //resets all other values back to default
    z = -35;
    pipeCount = 0;
    totalPipesInScene = 0;

    document.getElementById("pipeCount").innerText = pipeCount.toString();

    storky.position.set(0, 0, 0);
    storkyBoxCollider.position.set(0, 0, 0);
}

//updates the positions of all the obstacles
//then checks for collisions
function updateLevelObjects() {
    for (let i = 0; i < levelObjects.length; i++){
        let obj = levelObjects[i];
        obj.position.z += 0.1;
        updateObstacleXAxis(obj);
        updateObstacleYAxis(obj);
    }

    checkForCollisions();
}

//updates X positions of obstacle horizontal associated moves
function updateObstacleXAxis(obj) {
    switch (obj.name) {
        case ObstacleMovingRight: // obstacle moving right
            if (obj.position.x <= 19) obj.position.x += 0.1;//if it can still go right, then go right
            else obj.name = ObstacleMovingLeft;//else start going left
            break;

        case ObstacleMovingLeft://obstacle moving left, approach same as above
            if(obj.position.x >= -19) obj.position.x -= 0.1;
            else obj.name = ObstacleMovingRight;
            break;
    }
}

//updates Y positions of obstacle horizontal associated moves
//approach same as above
function updateObstacleYAxis(obj) {
    switch (obj.name) {
        case ObstacleMovingUp:
            if (obj.position.y <= -17) obj.position.y += 0.05;
            else obj.name = ObstacleMovingDown;
            break;

        case ObstacleMovingDown:
            if(obj.position.y >= -34) obj.position.y -= 0.05;
            else obj.name = ObstacleMovingUp;
            break;
    }
}

//checks if the bird collided with anything
function checkForCollisions() {
    //creates a box from the birds box collider
    let birdCollider = new THREE.Box3().setFromObject(storkyBoxCollider);
    //gets the bounds of the box
    let birdColliderBounds = {
        xMin: birdCollider.min.x,
        xMax: birdCollider.max.x,
        yMin: birdCollider.min.y,
        yMax: birdCollider.max.y,
        zMin: birdCollider.min.z,
        zMax: birdCollider.max.z,
    };

    //iterates through each 3DObject
    for(let i = 0; i < levelObjects.length; i++){
        //creates a reference to the 3DObject
        let parent = levelObjects[i];
        //iterates the children of the 3DObject
        for (let k = 0; k < parent.children.length; k++){
            let child = parent.children[k];

            //storky failed to pass through the gate
            if (child.name === safeGate && parent.position.z > 0.8){
                gameOver();
                return;
            }

            //create a box from the child
            let childCollider = new THREE.Box3().setFromObject(child);

            //get the bounds of the box
            let childColliderBounds = {
                xMin: childCollider.min.x,
                xMax: childCollider.max.x,
                yMin: childCollider.min.y,
                yMax: childCollider.max.y,
                zMin: childCollider.min.z,
                zMax: childCollider.max.z,
            };

            //if (child.name === safeGate) console.log(childColliderBounds);

            //check if the bounds of the child and bird box collider overlap
            //if true, two objects collided
            if ( ( birdColliderBounds.xMin <= childColliderBounds.xMax && birdColliderBounds.xMax >= childColliderBounds.xMin ) &&
                ( birdColliderBounds.yMin <= childColliderBounds.yMax && birdColliderBounds.yMax >= childColliderBounds.yMin) &&
                ( birdColliderBounds.zMin <= childColliderBounds.zMax && birdColliderBounds.zMax >= childColliderBounds.zMin) ) {
                //check what we actually hit
                switch (child.name) {
                    //collided with obstacle
                    case Obstacle:
                        gameOver();
                        break;

                        //collided with the game between two cylinders
                    case safeGate:
                        passedGate();
                        //since we collided with the game, we set it to
                        //empty name because we don't want to detect the collision again
                        child.name = "";
                        break;
                }

            }

        }
    }
}

//plays gameOverAudio, pauses the game
function gameOver() {
    let audio = new Audio("../../sounds/died.mp3");
    audio.play().then(r => {});
    gameInPlay = !gameInPlay;

    setTimeout(function () {
        document.getElementById("gameOver").style.display = "block";
        highScoreManager.addHighScore(pipeCount);
    }, 1000);

}

//called when bird passes through a gate
//plays a sound, then updates pipe count
function passedGate() {
    let audio = new Audio("../../sounds/gate_passed.mp3");
    audio.play().then(r => {});
    pipeCount++;
    document.getElementById("pipeCount").innerText = pipeCount.toString() + "/" + totalPipesInScene.toString();

    //check if game finished
    if (pipeCount === totalPipesInScene) gameComplete();
}

//random value generator
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
