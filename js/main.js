let co = el("#canvas");
let ctx = co.getContext("2d");
let tCode = false;
let brickCollector = {};
let brickIndex = 0;
let punkte = 0,
  leben = 0;
let animate = false;
let selectedLeben = 1;
let musicOn = false;

const selectLive = document.getElementById("select-leben");
selectLive.addEventListener("change", function () {
  selectedLeben = parseInt(selectLive.value);
  leben = selectedLeben;
  el("#leben").innerText = ` ${leben}`;
});

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", function () {
  leben = 0;
  el("#punkte").innerText = ` ${leben}`;
  selectedLeben = 1;
  window.location.reload();
});

const music = new Audio("../assets/music.mp3");

const musicBtn = document.getElementById("music-icon");

music.addEventListener("ended", function () {
  if (musicOn) {
    music.currentTime = 0;
    music.play();
  }
});

let playMusicBtn = document.getElementById("play-music");
playMusicBtn.innerText = "Music / On";
playMusicBtn.addEventListener("click", function () {
  playMusic();
  playMusicBtn.innerText = musicOn ? "Music / Off" : "Music / On";
});

function playMusic() {
  musicOn = !musicOn;
}

let protoBrick = {
  x: 10,
  y: 10,
  w: 60,
  h: 20,
  id: 0,
  col: "rgb(255,0,0)",
  init: function () {
    brickCollector[brickIndex] = this;
    this.id = brickIndex;
    brickIndex++;
  },

  collision: function () {
    if (kollision(ball, this)) {
      if (ball.ry === 0) {
        ball.ry = 1;
      } else {
        ball.ry = 0;
      }

      delete brickCollector[this.id];
      punkte++;
      el("#punkte").innerText = ` ${punkte}`;

      if (punkte === 40) {
        console.log("Schwierigkeit erhöht!");

        klonFabrik(50);

        ball.spX *= 1.2;
        ball.spY *= 1.2;

        paddle.speed = paddle.speed ? paddle.speed * 1.2 : 12;
      }

      let props = Object.keys(brickCollector);
      if (props.length === 0) {
        klonFabrik();
        ball.y = 150;
      }
    }
    this.draw();
  },

  draw: function () {
    ctx.fillStyle = this.col;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  },
};

let ball = {
  x: 100,
  y: 150,
  r: 15,
  spX: 5,
  spY: 3,
  rx: 0,
  ry: 0,
  col: "rgb(0,255,0)",
  move: function () {
    if (this.x < 0) {
      this.rx = 0;
    }
    if (this.x > co.width) {
      this.rx = 1;
    }
    if (this.y < 340 && kollision(this, paddle)) {
      this.ry = 1;
    }
    if (this.y < 0) {
      this.ry = 0;
    }
    if (this.y > co.height) {
      this.y = 150;
      this.x = Math.ceil(Math.random() * co.width);
      this.ry = 0;

      selectedLeben--;
      leben = selectedLeben;
      el("#leben").innerText = ` ${leben}`;
      if (selectedLeben <= 0) {
        cancelAnimationFrame(animate);
        ctx.fillStyle = "black";
        ctx.font = "100px, Arial";
        ctx.fillText("Game Over", 10, 200);
        music.pause();
        playMusicBtn.innerText = "Music / On";
      }
    }

    if (this.rx === 0) {
      this.x += this.spX;
    }
    if (this.rx === 1) {
      this.x -= this.spX;
    }

    if (this.ry === 0) {
      this.y += this.spY;
    }
    if (this.ry === 1) {
      this.y -= this.spY;
    }
    this.draw();
  },
  draw: function () {
    ctx.fillStyle = this.col;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
  },
};

let paddle = {
  x: 410,
  y: 350,
  w: 120,
  h: 20,
  col: "rgb(0,0,255)",
  speed: 10,

  move: function () {
    if (tCode === "ArrowLeft" && this.x > 0) {
      this.x -= this.speed;
    }
    if (tCode === "ArrowRight" && this.x < co.width - this.w) {
      this.x += this.speed;
    }
    this.draw();
  },
  draw: function () {
    ctx.fillStyle = this.col;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  },
};

function render() {
  leben = selectedLeben;

  animate = requestAnimationFrame(render);
  ctx.clearRect(0, 0, co.width, co.height);

  paddle.move();
  for (let i in brickCollector) {
    brickCollector[i].collision();
  }

  ball.move();
}

function klonFabrik(brickCount = 40) {
  let x = 10,
    y = 10,
    dist = 90;

  for (let i = 0; i < brickCount; i++) {
    let klon = Object.create(protoBrick);
    klon.init();

    klon.x = x;
    klon.y = y;

    x += dist;
    if (x > co.width) {
      x = 10;
      y += 30;
    }
  }
}

function kollision(circle, rect) {
  let distX = Math.abs(circle.x - rect.x - rect.w / 2);
  let distY = Math.abs(circle.y - rect.y - rect.h / 2);
  if (distX > rect.w / 2 + circle.r) {
    return false;
  }
  if (distY > rect.h / 2 + circle.r) {
    return false;
  }
  if (distX <= rect.w / 2) {
    return true;
  }
  if (distY <= rect.h / 2) {
    return true;
  }
  let dx = distX - rect.w / 2;
  let dy = distY - rect.h / 2;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function checkDown(e) {
  tCode = e.key;
}
function checkUp() {
  tCode = false;
}

function startGrafik() {
  ball.draw();
  paddle.draw();

  for (let i in brickCollector) {
    brickCollector[i].draw();
  }
}

document.addEventListener("keydown", checkDown);
document.addEventListener("keyup", checkUp);

klonFabrik();
startGrafik();

el("#start-stop").addEventListener("click", function () {
  if (!animate) {
    render();
    this.innerText = "Pause";
    if (musicOn) {
      music.play();
      playMusicBtn.innerText = "Music / Off";
      setTimeout(() => {
        music.play();
      }, 74000);
    }
  } else {
    leben = selectedLeben;
    el("#leben").innerText = ` ${leben}`;

    this.innerText = "Start";
    if (musicOn) {
      music.pause();
      playMusicBtn.innerText = "Music / On";
    }
    cancelAnimationFrame(animate);
  }

  animate = !animate;
});
