//all the string constants are defined here

//names for the objects
let Obstacle = "obstacle";
let safeGate = "safeGate";

//names for pipe movements
//the names define the movement behaviour of the pipe
//e.g. obstacleMovingRight means the pipe is moving to the
//right, the update is done in LevelManager
let ObstacleMovingRight = "obstacleMovingRight";
let ObstacleMovingLeft = "obstacleMovingLeft";
let ObstacleMovingUp = "obstacleMovingUp";
let ObstacleMovingDown = "obstacleMovingDown";

//list of movements
//used for randomly picking a move
let horizontalMovements = [ObstacleMovingRight, ObstacleMovingLeft];
let verticalMovements = [ObstacleMovingUp, ObstacleMovingDown];
let horizontalVerticalMovements = [ObstacleMovingRight, ObstacleMovingUp, ObstacleMovingLeft, ObstacleMovingDown];

//randomly picks horizontal movements
function getRandomHorizontalMovement() {
    return horizontalMovements[Math.floor(Math.random() * horizontalMovements.length)];
}

function getRandomVerticalMovement() {
    return verticalMovements[Math.floor(Math.random() * verticalMovements.length)];
}

function getRandomHorizontalVerticalMovement() {
    return horizontalVerticalMovements[Math.floor(Math.random() * horizontalVerticalMovements.length)];
}
