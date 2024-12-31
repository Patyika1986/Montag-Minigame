
let co = el('#canvas'); // co createn
let ctx = co.getContext('2d'); // Damit in 2d gezeigt wird ist wichtig
let tCode          = false; // Speichert die gedrückte Taste
let brickCollector = {}; // Hier kommen alle Bricks rein 
let brickIndex     = 0; // Das erste wert von der Index
let punkte = 0, leben = 0; // Punkte und Leben 
let animate        = false; // button kommt animate an 
let selectedLeben = 1;
let musicOn = false;





const selectLive = document.getElementById("select-leben");
selectLive.addEventListener("change", function(){
    selectedLeben = parseInt(selectLive.value);
    leben = selectedLeben;
    el('#leben').innerText = ` ${leben}`;
});

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", function(){
    leben = 0;
    el('#punkte').innerText = ` ${leben}`;
    selectedLeben = 1;
    window.location.reload();

});

const music = new Audio("../assets/music.mp3");

const musicBtn = document.getElementById("music-icon");

music.addEventListener('ended', function () {
    if (musicOn) {
        music.currentTime = 0; // Zurück zum Anfang der Musik
        music.play(); // Musik erneut abspielen
    }
});


let playMusicBtn = document.getElementById("play-music");
playMusicBtn.innerText = "Music / On";
playMusicBtn.addEventListener("click", function(){
    playMusic();
    playMusicBtn.innerText = musicOn ? "Music / Off" : "Music / On";
});


function playMusic(){
    musicOn = !musicOn;
}

// Die Spielfuguren


// Prototiyp für die bricks
let protoBrick   = {
    x     : 10,         // Horizontal
    y     : 10,         // Vertikal
    w     : 60,         // Breite
    h     : 20,         // Höhe
    id    : 0,          // ID
    col   : 'rgb(255,0,0)',
    // Hier kommen alle Brick rein und werden immer mit 1 ++ erhöht mit der Index
    init     : function(){
        brickCollector[brickIndex] = this;
        this.id = brickIndex;
        brickIndex ++;
    },
    // Collision berechnung
    collision: function(){
        if(kollision(ball,this)){
            // Ball muss wieder nach unten
            if(ball.ry === 0){
                ball.ry = 1; // Prallt von den Bricks ab
            }else{
                ball.ry = 0; // Prallt von den Bricks ab
            }
          

            // bricks löschen was mit der ball stößt
            delete brickCollector[this.id];
            // Punktezähler
            punkte ++;
            el('#punkte').innerText = ` ${punkte}`;

            // was passiert wenn alle bricks gelöscht sind
            let props = Object.keys(brickCollector);
            if(props.length === 0){
                klonFabrik(); // Neue bricks wieder.
                ball.y = 150;  // Start position von der Ball
            }
        }
        this.draw();
    },
    // draw ist zum mallen was du in der protoBrick geschrieben hast 
    draw     : function(){
        ctx.fillStyle = this.col;                     // Hier kommt rein alles was das Style angeht
        ctx.fillRect(this.x,this.y,this.w,this.h);    // Parametern von der Canvas 
    }
};

// Das Ball
let ball         = {

    x    : 100,   // Mitte X - Position
    y    : 150,   // Kreis Mitte Y - Position
    r    : 15,     // Radius
    spX  : 5,      // Speed X - Achse
    spY  : 3,     // Speed Y - Achse
    rx   : 0,     // Richtung 0:rechts -- 1:Links
    ry   : 0,     // Richtung 0:runter -- 1: Rauf
    col  : 'rgb(0,255,0)',
    move : function(){

        // Collision Rechte Wand
        if(this.x < 0){this.rx = 0;}
        // Collision Linke Wand
        if(this.x > co.width){this.rx = 1;}
        // Collision Ball  - Paddle 
        if(this.y < 340 && kollision(this,paddle)){
            this.ry = 1; // Kugel nach oben
        }
        // Collision  Oben im Canvas
        if(this.y < 0){this.ry = 0;} // nach unten
        // Collsion unten -- wenn das paddle nicht ereicht hat
        if(this.y > co.height){
            this.y = 150; // Ball nach oben
            this.x = Math.ceil(Math.random() * co.width); // zufäligge position auf der x Achse
            // ball muss wieder runter schweben
            this.ry = 0;

            // Lebenzähler
            selectedLeben --;
            leben = selectedLeben;
            el('#leben').innerText = ` ${leben}`;
            // Was passiert wenn leben === 3 erreicht Game Over
            if(selectedLeben <= 0){
                cancelAnimationFrame(animate);
                ctx.fillStyle = 'black';
                ctx.font = '100px, Arial';
                ctx.fillText('Game Over',10,200);
                music.pause();
                playMusicBtn.innerText = "Music / On";
            }
      

        }
        // Bewegung festleggen

        if(this.rx === 0){this.x += this.spX;} // Lauf nach Rechts
        if(this.rx === 1){this.x -= this.spX;} // Lauf nach Links

        if(this.ry === 0){this.y += this.spY;}
        if(this.ry === 1){this.y -= this.spY;}
        this.draw();
    },
    draw : function(){
        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,2 * Math.PI,false);
        ctx.fill();   // ist die farbe 
        ctx.stroke(); // das border von der kreis
    }
};

// Das Paddle 
// Seh wichtig die Reihenfolge zu beachten !
let paddle       = {
    x      : 410,
    y      : 350,
    w      : 120,
    h      : 20,
    col    : 'rgb(0,0,255)',
    // Bewegungen
    move   : function(){

        // if zum tasten bewegen
        // 5 ist ein Geschwindigkeit.
        //  && this.x > 0: x soll nicht kleiner sein als 0.   damit links nicht raus geht
        if(tCode === 'ArrowLeft' && this.x > 0){
            this.x -= 10; // geschwidigkeit nach links
        };
        if(tCode === 'ArrowRight' && this.x < co.width - this.w){
            this.x += 10; // geschwidigkeit nach rechts
        };

        this.draw();
    },
    // Canvas befehle zum Stylen und sein werte wie hoch und breit 
    draw   : function(){
        ctx.fillStyle = this.col;
        ctx.fillRect(this.x,this.y,this.w,this.h);
    }
};


function render(){
    leben = selectedLeben;

    animate = requestAnimationFrame(render);  // 60:fps | ist ähnlich wie ein setTimeout.
    ctx.clearRect(0,0,co.width,co.height); // alle Pixel transparent. clearRect

    paddle.move();
    // for in weil das um ein object sisch hieer handelt
    for(let i in brickCollector){ // ist in brickCollektor alle geschpeichert 
        brickCollector[i].collision(); // hier ist ein brick zu sehen weil alle auf einenander stehen. damit du alle sehen kannst musst du die position von alle bricks anders zu weisen was die positionen angeht
    };

    ball.move();
};

// Mehrere Bricks zum createn  nur für die Bricks
function klonFabrik(){

    // Hilfsvariablen für die Position
    let x = 10, y = 10, dist = 90;

    for(let i = 0; i < 40; i++ ){
        let klon = Object.create(protoBrick); // create 40 weitere bricks
        klon.init();

        // Positionierung der Bricks
        klon.x = x;
        klon.y = y;
        
        x += dist;
        if(x > co.width){
            x = 10;  // Horizontal 10 Stück
            y += 30;  // Vertikal 30 Stück
        };
    };
};

// Abfrage der kollission ein kreis mit rechtecken.
function kollision(circle,rect){
    let distX = Math.abs(circle.x - rect.x-rect.w/2);
    let distY = Math.abs(circle.y - rect.y-rect.h/2);
    if (distX > (rect.w/2 + circle.r)) { return false; }
    if (distY > (rect.h/2 + circle.r)) { return false; }
    if (distX <= (rect.w/2)) { return true; } 
    if (distY <= (rect.h/2)) { return true; }
    let dx=distX-rect.w/2;
    let dy=distY-rect.h/2;
    return (dx*dx + dy*dy<=(circle.r*circle.r));
}; // ENDE kollision

// Check die Tasten waas du druckst
function checkDown(e){

    tCode = e.key; // e und key ist hier sehr wichtig !
    //e.preventDefault(); // den browsser verbietten den tastatur zu reagieren.
};
function checkUp(){

    tCode = false;
};

// Anzeige bevor das spiel beginnt
function startGrafik(){
    ball.draw();
    paddle.draw();

    // Bricks grafik starten ohne animation
    for(let i in brickCollector){
        brickCollector[i].draw();
    };

};


// Sind mit functionen verbunden keydown,und keyup.
document.addEventListener('keydown',checkDown);
document.addEventListener('keyup',checkUp);


klonFabrik();
startGrafik();
//render(); ab jetzt geht mit button
// Für denn Button
// Am anfang kommt animmate mit false an
el('#start-stop').addEventListener('click',function(){
    if(!animate){ // Check: ist animate False ? ja
        render(); // wenn ich klicke dann läuft wieder
        this.innerText = "Pause";
        if(musicOn){
            music.play();
            playMusicBtn.innerText = "Music / Off";
            setTimeout(() => {
                music.play();
            },74000);
        }
    }else{
        leben = selectedLeben;
    el('#leben').innerText = ` ${leben}`;

    this.innerText = "Start";
    if(musicOn){
        music.pause();
        playMusicBtn.innerText = "Music / On";
    }
        cancelAnimationFrame(animate); // hält animate an
    }

    animate = !animate;
});