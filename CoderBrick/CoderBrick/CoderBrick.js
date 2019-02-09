window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var myGamePlatform;
var myGameBall;

var myGameArea = {
   starttime : null,
   time: 0,
   keycode: null,
   canvas: document.createElement("canvas"),
   start: function () {
      this.canvas.width = 480;
      this.canvas.height = 270;
      this.context = this.canvas.getContext("2d");
      document.body.insertBefore(this.canvas, document.body.childNodes[0]);
      document.addEventListener('keydown', keyDown);
      document.addEventListener('keyup', keyUp);
      requestAnimationFrame(updateGameArea);
   },
   clear: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }
}

function startGame() {
   myGamePlatform = new gamePlatform(75, 10, "red", 225, 240);
   myGameBall = new gameBall(10, "green", 100, 100);
   myGameArea.start();
}

function updateGameArea(timestamp) {
   if (myGameArea.starttime == null)
      myGameArea.starttime = timestamp;
   else
      myGameArea.time = timestamp - myGameArea.starttime;
   myGameArea.clear();
   myGamePlatform.update();
   myGameBall.update();
   requestAnimationFrame(updateGameArea);
}

function getSpeed(initialSpeed, acceleration, time) {
   return initialSpeed + acceleration * time;
}

function gamePlatform(width, height, color, x, y) {
   this.width = width;
   this.height = height;
   this.x = x;
   this.y = y;
   this.leftMoveTime = 0;
   this.rightMoveTime = 0;
   this.update = function () {
      var leftMove = true;
      var moveTime = this.leftMoveTime;
      if (moveTime <= 0) {
         moveTime = this.rightMoveTime;
         leftMove = false;
      }
      if (moveTime > 0) {
         var timeLeft = (myGameArea.time - moveTime) / 10;
         var moveDiff = 0;
         // compute an acceleration until the maximum speed (equals to 5)
         if (getSpeed(0, 1.25, timeLeft) < 5) {
            moveDiff = getSpeed(0, 1.25, timeLeft);
         }
         else {
            moveDiff = 5;
         }

         if (leftMove)
            this.x -= moveDiff;
         else
            this.x += moveDiff;

         if (this.x < 0)
            this.x = 0;
         if (this.x > myGameArea.canvas.width - this.width)
            this.x = myGameArea.canvas.width - this.width;
      }
      
      ctx = myGameArea.context;
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
   }
}

function gameBall(radius, color, x, y) {
   this.x = x;
   this.y = y;
   this.radius = radius;
   this.update = function () {
      ctx = myGameArea.context;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
   }
}

function movePlatformLeft() {
   myGamePlatform.leftMoveTime = myGameArea.time;
}

function movePlatformRight(){
   myGamePlatform.rightMoveTime = myGameArea.time;
}

function clearPlatformMove() {
   myGamePlatform.leftMoveTime = 0;
   myGamePlatform.rightMoveTime = 0;
}

function keyDown(e) {
   if ((e.code == "ArrowLeft") || (e.code == "ArrowRight")) {
      if (myGameArea.keycode == null) {
         myGameArea.keycode = e.code;
         if (e.code == "ArrowLeft")
            movePlatformLeft();
         else
            movePlatformRight();
      }
   }
}

function keyUp(e) {
   if (e.code == myGameArea.keycode) {
      clearPlatformMove();
      myGameArea.keycode = null;
   }
}