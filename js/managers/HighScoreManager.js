//OOP Implementation
//this class is responsible for saving and displaying high scores
class HighScoreManager{

    constructor() {
        //init the name of the list
        this.listName = "highScores";
    }

    //gets the score array from local
    get scoresArray(){
        let array;
        //scores get saved as json array string inside localStorage
        let jsonString = localStorage.getItem(this.listName);
        //if the are no scores saved, init array to empty
        if (jsonString == null || jsonString === "") array = [];
        //else convert the json array string to JSON array
        else array = JSON.parse(jsonString);
        //return the array
        return array;
    }

    //this function takes in a p(paragraph - hgihScoreView) tag
    //then displays the high score in the p tag provided
    displayHighScores(highScoreView){
        //retrieve score
        let scores = this.scoresArray;
        //sort from highest to lowest
        scores.sort(function (a, b) {
            return b.playerScore - a.playerScore;
        });

        //add the column names in the p tag
        highScoreView.innerHTML = "Name - Score <br/>";

        //add the individual score
        //then move to new line (<br/>)
        for(let i = 0; i < scores.length; i++){
            let item = scores[i];
            highScoreView.innerHTML += item.playerName + " - " + item.playerScore +" <br/>";
        }

    }

    //saves the score in the localStorage
    addHighScore(score){
        //asks for user to input name
        let name = prompt("Enter your name, great player", "");
        //retrieve the scores array
        let scores = this.scoresArray;
        //add the name and score of player
        scores.push({playerName: name, playerScore: score});
        //then save the new score into the array
        localStorage.setItem(this.listName, JSON.stringify(scores));
    }

}
