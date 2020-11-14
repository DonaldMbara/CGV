//listen for when game finishes loading
window.addEventListener("load", function () {
    //set the background music to auto loop
    document.getElementById("backgroundMusic").loop = true;
    //build the scene
    buildScene();

    //start the infinite game logic loop
    gameLogicLoop();

    function gameLogicLoop() {
        requestAnimationFrame(gameLogicLoop);
        updateObjects();
        renderScene();
    }

    //calls all the functions that update objects in the scene
    function updateObjects() {
        //if game not paused, then update objects
        if(gameInPlay){
            updateBird();
            updateCamera();
            updateLevelObjects();
            updateSpotLight();
        }
    }

});

