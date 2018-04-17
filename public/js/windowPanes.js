"use strict";

//  Constants
//  Can be adjusted as necessary
var MAX_WIDTH = 16;
var MAX_HEIGHT = 16;
var HUE_RANGE = 150;
var MAX_LIGHTNESSS = 80;
var MIN_LIGHTNESSS = 15;

var hueRatio = HUE_RANGE / 90;
var lightnessRadius = (MAX_WIDTH + MAX_HEIGHT) / 8;

//  Center constraint keeps center of color wheel from being too close to any edge.
var xCenterConstraint = MAX_WIDTH * 0.75;
var yCenterConstraint = MAX_HEIGHT * 0.75;

var puzzleFlip = document.getElementById("puzzleFlip");
var displayFlip = document.getElementById("displayFlip");
var levelLabel = document.getElementById("levelLabel");

var puzzleObj = {};
//  Initiate puzzleObj.
//  Is this actually necessary??  It might not be
for (var i = 0; i < MAX_HEIGHT; i++){
    puzzleObj[i] = {};
    for(var j = 0; j < MAX_WIDTH; j++){
      puzzleObj[i][j] = null;
    }
}

var squareArray = [];
for (var i = 0; i < MAX_HEIGHT; i++){
    squareArray[i] = [];
    for(var j = 0; j < MAX_WIDTH; j++){
      squareArray[i][j] = null;
    }
}

var patternNumbers = {
    "xOffset" : null,
    "yOffset" : null,
    "hueOriginAngle" : null,
    "hueOriginal" : null
};
var flipsForThisLevel = [];

var axisHoriz;
var axisVert;
var directionToFlip;

var levelNumber = 1;

var btnFlip = document.getElementById("btnFlip");
var btnReset = document.getElementById("btnReset");
var btnStart = document.getElementById("btnStart");

function executeFlip(){
    if (directionToFlip === "horiz"){
        flipHorizAtAxis(axisHoriz);
        btnFlip.removeEventListener("click", executeFlip);
        console.log("Remove event listener from flip button.");
    } else if (directionToFlip === "vert"){
        flipVertAtAxis(axisVert);
        btnFlip.removeEventListener("click", executeFlip);
        console.log("Remove event listener from flip button.");
    } else {
        console.log("Error! directionToFlip = "+directionToFlip);
    }
}

function flipVertAtAxis(axisNumber) {
    if (axisNumber > 0) {
		//var axisNumber = parseInt(inputAxisNumber.value, 10);
		console.log("Flip Vertical at axis "+axisNumber);
		var maxI = MAX_HEIGHT -1;
		var saveSquare;
		for (var i = 0; i <= MAX_HEIGHT / 2; i++){
			for (var j = axisNumber; j < MAX_WIDTH; j++){
				saveSquare = puzzleObj[i][j];
				puzzleObj[i][j] = puzzleObj[maxI - i][j];
				puzzleObj[maxI - i][j] = saveSquare;
			}
		}
		drawPuzzle();
		clearSelection();
    } else {
        clearSelection();
        displayFlip.innerHTML = "Anchor Square (top left) cannot be flipped";
    }
}

function flipHorizAtAxis(axisNumber) {
    if (axisNumber > 0) {
		//var axisNumber = parseInt(inputAxisNumber.value, 10);
		console.log("Flip Horizontal at axis "+axisNumber);
		var maxJ = MAX_WIDTH -1;
		var saveSquare;
		for (var i = axisNumber; i < MAX_HEIGHT; i++){
			for (var j = 0; j < MAX_WIDTH / 2; j++){
				saveSquare = puzzleObj[i][j];
				puzzleObj[i][j] = puzzleObj[i][maxJ - j];
				puzzleObj[i][maxJ - j] = saveSquare;
			}
		}
		drawPuzzle();
		clearSelection();
    } else {
        clearSelection();
        displayFlip.innerHTML = "Anchor Square (top left) cannot be flipped";
    }
}

function setRandomPattern() {
    //  Offset defines where center of color wheel lies
    //      (x,y) offset of (0,0) corresponds to center of grid.
    patternNumbers.xOffset = (xCenterConstraint / 2) - Math.floor(xCenterConstraint * Math.random());
    patternNumbers.yOffset = (yCenterConstraint / 2) - Math.floor(yCenterConstraint * Math.random());
  
    //  This prevents center of color wheel aligning too closely with center of grid
    //  THIS ALSO FEELS LIKE IT COULD BE DONE MORE EFFICIENTLY!
    //  TAKE ANOTHER LOOK AND SEE IF THIS IS TRUE!
    if (Math.abs(patternNumbers.xOffset) < MAX_WIDTH / 10){
        while(Math.abs(patternNumbers.yOffset) < MAX_HEIGHT / 10){
            patternNumbers.yOffset = (yCenterConstraint / 2) 
                    - Math.floor(yCenterConstraint * Math.random());
        }
    }
  
    //  This chunk was my original.  Did not have offsets, and also used specific numbers
    //  based on grid size of 10 x 10.
    /*var xOffset = 4 - Math.floor(9*Math.random());
    var yOffset = 4 - Math.floor(9*Math.random());*/
  
    patternNumbers.hueOriginAngle = 360 * Math.random();
    patternNumbers.hueOriginal = 360 * Math.random();
}

function setRandomFlips(levelNumber) {
    flipsForThisLevel = [];
    console.log("Setting flips for level " + levelNumber);
    var direction;
    var axis;
    for(var i = 0; i < levelNumber; i++){
        if(Math.random() < 0.5){
            direction = "horiz";
        } else {
            direction = "vert";
        }
        if(direction === "horiz"){
            axis = Math.floor(Math.random() * (MAX_HEIGHT - 1)) + 1;
        } else {
            axis = Math.floor(Math.random() * (MAX_WIDTH - 1)) + 1;
        }
        flipsForThisLevel.push({
            "direction" : direction,
            "axis" : axis
        });
    }
    console.log("flipsForThisLevel[] = " + flipsForThisLevel);
}

function makeArray() {   
    for(var i = 0; i < MAX_HEIGHT; i++){
        for(var j = 0; j < MAX_WIDTH; j++){
            var newSquareObj = {};
      
            var xNewSquare = j - (MAX_WIDTH / 2) + patternNumbers.xOffset;
            var yNewSquare = (MAX_HEIGHT / 2) - i + patternNumbers.yOffset;
            var hypotenuse = Math.sqrt(xNewSquare * xNewSquare + yNewSquare * yNewSquare);
            var sinNewSquare = (yNewSquare / hypotenuse) || 0;
            var arcsinNewSquare = Math.asin(sinNewSquare);
            var angleRad = arcsinNewSquare;
            if (xNewSquare < 0) {
                angleRad = Math.PI - angleRad;
            }
            if (angleRad < 0) {
                angleRad = 2*Math.PI + angleRad;
            }
            
            var angleDeg = (angleRad * 360) / (2 * Math.PI);
            var deltaAngleDeg = angleDeg - patternNumbers.hueOriginAngle;
            if (deltaAngleDeg < 0){
                deltaAngleDeg = 360 + deltaAngleDeg;
            }
            
            var adjustedAngle = Math.abs(90 - Math.abs(180 - deltaAngleDeg));
            
            //  This version gives full color wheel:
            /*
            var newHue = (angle * 360) / (2 * Math.PI);
            */
            //var newHue = angleDeg;
           
            var newHue = patternNumbers.hueOriginal + (adjustedAngle * hueRatio);
            
            //  This was original:
            
            //  Test this use of centerConstraint in pythagorean theorem.
            //  It might be OK, but might fail when center is at corner of constraints.
            //  var maxHypotenuse = Math.sqrt(xCenterConstraint * xCenterConstraint 
            //        + yCenterConstraint * yCenterConstraint);
                    
            //var lightnessRatio = hypotenuse / maxHypotenuse;
            //var newLightness = 35 + parseInt(2 * Math.abs(0.5 - lightnessRatio) * 60, 10);
            
            
            //  And this was intermediate:
            //var lightnessRatio = (hypotenuse % lightnessRadius) / lightnessRadius;
            //var newLightness = 35 + lightnessRatio * 60;
            
            
            //  *** Right now lightness radius is hardcoded above.
            //      Should it be calculated relative to something else?
            //      Maybe it is good, because it is already relative to MAX_H & MAX_L
            //  lightnessRadius ... do something here?
            
            var adjustedHypotenuse = hypotenuse % (2 * lightnessRadius);
            var lightnessRatio = 
                    (Math.abs(lightnessRadius - adjustedHypotenuse)) / lightnessRadius;
            var newLightness = 
                    MIN_LIGHTNESSS + lightnessRatio * (MAX_LIGHTNESSS - MIN_LIGHTNESSS);
            
            newSquareObj.hslColor = "hsl(" + newHue + ", 100%, " + newLightness + "%)";
            newSquareObj.winningI = i;
            newSquareObj.winningJ = j;
            //console.log("newLightness = " + newLightness);
            //console.log("newHue = " + newHue);
            //console.log("adjustedAngle = " + adjustedAngle);
            //console.log("hueRatio = " + hueRatio);
            //console.log(puzzleObj);
            puzzleObj[i][j] = newSquareObj;
        }
    }
    //console.log("hueOriginAngle = " + patternNumbers.hueOriginAngle);
}

function drawPuzzle(){
    puzzleFlip.innerHTML = null;
    
    for(var i = 0; i < MAX_HEIGHT; i++){
        var newRow = document.createElement("DIV");
        newRow.classList.add("rowStyle");
        for(var j = 0; j < MAX_WIDTH; j++){
            var newSquare = document.createElement("DIV");
            squareArray[i][j] = newSquare;
            newSquare.setAttribute("class", "squareStyle");
            newSquare.setAttribute("id", i+","+j);
            newSquare.style.backgroundColor = puzzleObj[i][j].hslColor;
            newRow.appendChild(newSquare);
            (function(){
                var axisHorizSelected = i;
                var axisVertSelected = j;
                newSquare.addEventListener("mousedown", function(){
                    console.log("axisHorizSelected="+axisHorizSelected+",axisVertSelected="+axisVertSelected);
                    axisHoriz = axisHorizSelected;
                    axisVert = axisVertSelected;
                });
            })();
        }   
        
        // This son of a bitch was the culprit the whole time!!!@!!
        //newRow.innerHTML += "<br/>";
                
        puzzleFlip.appendChild(newRow);
    }
    if(checkForWin()){
        if(confirm("Complete! Proceed to next level...")){
			levelNumber += 1;
			startNewLevel(levelNumber);
        }
    }
}

function resetPuzzle(){
    console.log(puzzleObj);
    makeArray();
    mixUpPuzzle()
    drawPuzzle();
}

function startNewLevel(levelNumber) {
	setRandomPattern();
	setRandomFlips(levelNumber);
	makeArray();
	mixUpPuzzle();
	drawPuzzle();
	levelLabel.innerHTML = "Level " + levelNumber;
}

function mixUpPuzzle() {
    for(var i = 0; i < flipsForThisLevel.length; i++){
        if(flipsForThisLevel[i].direction === "horiz"){
            flipHorizAtAxis(flipsForThisLevel[i].axis);
            console.log("Mix direction: " + flipsForThisLevel[i].direction + ", axis: " + flipsForThisLevel[i].axis);
        } else if(flipsForThisLevel[i].direction === "vert"){
            flipVertAtAxis(flipsForThisLevel[i].axis);
            console.log("Mix direction: " + flipsForThisLevel[i].direction + ", axis: " + flipsForThisLevel[i].axis);
        } else {
            console.log("Error, direction = " + flipsForThisLevel[i].direction);
        }        
    }
}

function checkForWin() {
    for (var i = 0; i < MAX_HEIGHT; i++){
        for (var j = 0; j < MAX_HEIGHT; j++){
            if(puzzleObj[i][j].winningI != i || puzzleObj[i][j].winningJ != j){
                return false;
            }
        }
    }    
    
    return true;
}

var xMouseDown;
var yMouseDown;
var xMouseUp;
var yMouseUp;

/*
Sources:
    https://developer.mozilla.org/en-US/docs/Web/Events/mousedown
    https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/screenX
*/
puzzleFlip.addEventListener("mousedown", function (evt) {
    xMouseDown = evt.screenX;
    yMouseDown = evt.screenY;
    console.log("mousedown at screen coordinates (" + xMouseDown + "," + yMouseDown + ")");
});

puzzleFlip.addEventListener("mouseup", function (evt) {
    xMouseUp = evt.screenX;
    yMouseUp = evt.screenY;
    if(testSelection()){
        btnFlip.addEventListener("click", executeFlip);
        console.log("Add event listener to flip button. directionToFlip="+directionToFlip);
        addHighlights();
    } else {
    
        //  At the moment this is done in the testSelection function, 
        //  but it probably should be separated out.
        
        //btnFlip.removeEventListener("click", executeFlip);
        //console.log("Remove event listener from flip button.");
    }
});

btnReset.addEventListener("click", resetPuzzle);
btnStart.addEventListener("click", function(){
    levelNumber = 1;
    startNewLevel(levelNumber);
});


//  Screen coordinates, 
//  AKA Right corresponds to X increasing and Down corresponds to Y increasing
//
//  What is minimum for deltaX or deltaY?  Play with this and find sweet spot.
function testSelection() {
    console.log("Test selection");
    var deltaX = xMouseUp - xMouseDown;
    var deltaY = yMouseUp - yMouseDown;
    console.log("deltaX="+deltaX+" ,deltaY="+deltaY);
    if(deltaX >= 50 && Math.abs(deltaX/deltaY) > 2){
        console.log("Selected from vertical axis "+axisVert);
        displayFlip.innerHTML = "Selected from vertical axis "+axisVert;
        directionToFlip = "vert";
        return true;
    } else if(deltaY >= 50 && Math.abs(deltaY/deltaX) > 2){
        console.log("Selected from horizontal axis "+axisHoriz);
        displayFlip.innerHTML = "Selected from horizontal axis "+axisHoriz;
        directionToFlip = "horiz";
        return true;
    } else {
        clearSelection();
        return false;
    }
}

function clearSelection() {
    directionToFlip = null;
    axisHoriz = null;
    axisVert = null;
    displayFlip.innerHTML = "No selection";
    btnFlip.removeEventListener("click", executeFlip);
    console.log("Remove event listener from flip button.");
    removeHighlights();
}

function addHighlights() {
    if (directionToFlip == "vert") {
        for (var i = 0; i < MAX_HEIGHT; i++) {
            for (var j = axisVert; j < MAX_WIDTH; j++) {
                squareArray[i][j].classList.add("highlight");             
            }
        }
    } else if (directionToFlip == "horiz") {
        for (var i = axisHoriz; i < MAX_HEIGHT; i++) {
            for (var j = 0; j < MAX_WIDTH; j++) {
                squareArray[i][j].classList.add("highlight");              
            }
        }
    } else {
        console.log("Error, directionToFlip = " + directionToFlip);
    }
}

function removeHighlights() {
   for (var i = 0; i < MAX_HEIGHT; i++) {
		for (var j = 0; j < MAX_WIDTH; j++) {
			squareArray[i][j].classList.remove("highlight");
		}
	}
}



