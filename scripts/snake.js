const productionMode = false;
const serverUrl = productionMode ? 'https://amomonika.duckdns.org' : 'http://localhost:3000';  

const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    console.log('No user found, redirecting to login page...');
    window.location.href = 'index.html';
} else {
    document.querySelector('#usernameDisplay').textContent = user.username;
}




let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let players = [];    
let score = 0;
let start=false;
let gameOverAlreadyHandled = false;
let inputs = [];
let direction = "right";
let lastDirection="right";
let cols = 17;
let rows = 15;
let snake = [
    {x:7,y:8},
    {x:6,y:8},
    {x:5,y:8}
];
let apple = {
    x: 11,
    y: 8
};
loadPlayers().then(() => {updateTable();});



let interval = document.getElementById("speed").value;
let gameInterval;



gameInterval = setInterval(gameLoop, interval);

//gameloop an Speed anpassen

document.getElementById("speed").addEventListener("input", function () {
   
    interval = document.getElementById("speed").value;

    clearInterval(gameInterval);

    gameInterval = setInterval(gameLoop, interval);
});

//Funktionen


//Tastatur abfragen
document.addEventListener("keydown", keyDown)

function keyDown(e){
    nextInput = inputs[0]

    if (e.key == 'a' && nextInput != "left" && nextInput != "right") {
        if(nextInput){
            inputs[1] = "left";
            return;
        }
        if(lastDirection != "left" && lastDirection != "right"){
            return inputs[0] = "left";
        }
    }
    
    if (e.key == 'd' && nextInput != "left" && nextInput != "right") {
        if(nextInput){
            inputs[1] = "right";
            return;
        }
        if(lastDirection != "left" && lastDirection != "right"){
            return inputs[0] = "right";
        }
    }

    if (e.key == 'w' && nextInput != "top" && nextInput != "bot") {
        if(nextInput){
            inputs[1] = "top";
            return;
        }
        if(lastDirection != "top" && lastDirection != "bot"){
            return inputs[0] = "top";
        }
    }

    if (e.key == 's' && nextInput != "top" && nextInput != "bot") {
        if(nextInput){
            inputs[1] = "bot";
            return;
        }
        if(lastDirection != "top" && lastDirection != "bot"){
            return inputs[0] = "bot";
        }
    }

    if (e.key == ' ') {
        start = true;
        document.getElementById("speed").disabled = true; // Disable
    }
}

//Hintergrund erstellen
function bg(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'grey';
    let x = 4;
    let y = 4;
    for(let j=0; j<rows;j++){
        for (let i = 0; i < cols; i++){
            ctx.fillRect(x,y,32,32);
            x = x+36;
        }
        x = 4
        y = y+36;
    }
    y = 4
}

//
function snk(){

    //Richtung ändern
    console.log(direction, "          ", inputs[0], inputs[1], "         ", lastDirection);

    if(start==true){

        nextDirection = inputs[0];

        if(nextDirection){
            direction = nextDirection;
        }

        if(direction=="right"){
            temp = {x:snake[0].x+1, y:snake[0].y}
            snake.unshift(temp);
            lastDirection = direction;
            inputs[0] = inputs[1];
            inputs[1] = null;

        }
        if(direction=="left"){
            temp = {x:snake[0].x-1, y:snake[0].y}
            snake.unshift(temp);
            lastDirection = direction;
            inputs[0] = inputs[1];
            inputs[1] = null;
        }
        if(direction=="top"){
            temp = {x:snake[0].x, y:snake[0].y-1}
            snake.unshift(temp);
            lastDirection = direction;
            inputs[0] = inputs[1];
            inputs[1] = null;
        }
        if(direction=="bot"){
            temp = {x:snake[0].x, y:snake[0].y+1}
            snake.unshift(temp);
            lastDirection = direction;
            inputs[0] = inputs[1];
            inputs[1] = null;
        }

        //Apfel essen

        if((snake[0].x)==(apple.x) && (snake[0].y)==(apple.y)){
            randApple();
            score++;
        }
        else{
            f = snake.pop();    //letztes Element der Schlange entfernen
        }
    }

    //Schlange auf canvas zeichnen
    for(let l=0;l<snake.length;l++){
        let a = snake[l].x;
        ax = (a*36)-36+4;
        let b = snake[l].y;
        bx = (b*36)-36+4;
        ctx.fillStyle = document.getElementById("col").value;
        ctx.fillRect(ax,bx,32,32);
    }
}

//Apfel zeichnen
function apl(){
    let a = apple.x;
    let ax = (a*36)-36+4
    let b = apple.y;
    let bx = (b*36)-36+4
    ctx.fillStyle = 'red';
    ctx.fillRect(ax,bx,32,32);
}
function randApple(){
    let x = apple.x;
    let y = apple.y;    

    while(existInSnake(x,y)==true){         //es wird ein Fald welches NICHT in der Schlange ist gesucht
        x = Math.floor(Math.random() * cols) + 1;       //math.floor --> abrunden, danach +1
        y = Math.floor(Math.random() * rows) + 1;       
    }
    apple = {x:x, y:y}
}
function existInSnake(x,y){
    return snake.some(coord => coord.x === x && coord.y === y);     //some --> mind. ein treffer, überprüft ob neuer Apfel in der Schlange vorkommt
}


function gameOver(){
    if(gameOverAlreadyHandled){return};

    let snakeHead = snake[0];
    let snakeBody = snake.slice(1);
    let double = snakeBody.find(f => f.x == snakeHead.x && f.y == snakeHead.y)   //checkt ob erste Element des Arrays Snake die gleichen Koordinaten wie eines der anderen hat
    let isLost = snake[0].x<1 || snake[0].x>cols || snake[0].y<1 || snake[0].y>rows || double //Bedingungen fürs Verlieren


    if(isLost){   
        start=false;
        gameOverAlreadyHandled = true;
        document.getElementById("speed").disabled = false; // Enable

        const speedSelect = document.querySelector("#speed")
        let speed = speedSelect.options[speedSelect.selectedIndex].text;

        updateHighscore(score, speed)
        .then(() => loadPlayers())
        .then(() => updateTable())

        direction="right";
        lastDirection="right";
        inputs = []
        snake = [ {x:7,y:8}, {x:6,y:8}, {x:5,y:8} ];
        apple = {x: 11, y: 8};
        gameOverAlreadyHandled = false;
        score = 0;  
    }    
}


function gameLoop(){
    gameOver()
    if(gameOverAlreadyHandled){return}
    bg()
    snk()
    apl()
}

async function loadPlayers() {
    try{
        const response = await fetch(`${serverUrl}/api/getHighscores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    
        const data = await response.json();
        if (!response.ok) {return} 
        players = data.players;
    }
    catch(err){
        console.log("Error loading playerList:", err)
    }
    
}

async function updateHighscore(highscore, speed){
    try{
        const response = await fetch(`${serverUrl}/api/updateHighscore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                highscore: highscore,
                speed: speed
            })
        });

        const data = await response.json();

        if (!response.ok){
            console.error('Error updating highscore:', data.message);
            return;
        }
    }
    catch(err){
        console.error('Error updating highscore:', err);

    }  
}

function updateTable(){

    const tableBody = document.querySelector("#table tbody");
    tableBody.innerHTML = "";

    players.sort((a,b) => b.snakeHighscore - a.snakeHighscore)
    players.forEach(player => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = player.username;
        row.appendChild(nameCell);

        const scoreCell = document.createElement("td");
        scoreCell.textContent = player.snakeHighscore || 0;
        row.appendChild(scoreCell);

        const speedCell = document.createElement("td");
        speedCell.textContent = player.snakeSpeed || "N/A";
        row.appendChild(speedCell);

        tableBody.appendChild(row);
    });
}

function logOut(){
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}