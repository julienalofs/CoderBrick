window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var myGamePlatform;
var myGameBall;
var myGameDecor;
var myUnbreakableBricks;
var totalLifes = 3;

var myGameArea = {
   starttime : null,
   time: 0,
   keycode: null,
   width: 480,
   height: 350,
   start: function () {
      document.getElementById("life").innerHTML = totalLifes.toString();
      this.canvas = document.getElementById("myCanvas");
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.context = this.canvas.getContext("2d");
      document.addEventListener('keydown', keyDown);
      document.addEventListener('keyup', keyUp);
      requestAnimationFrame(updateGameArea);
   },
   clear: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
   },
   gameover: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx = this.context;
      ctx.fillStyle = "red";
      ctx.font = "30px Arial";
      ctx.fillText("GAME OVER",this.canvas.width/2 - 100,this.canvas.height/2);
   },
   removeLife: function () {
      totalLifes--;
      document.getElementById("life").innerHTML = totalLifes.toString();
   }
}

function gameDecor(color) {
   this.color = color;
   this.update= function () {
      ctx = myGameArea.context;
      ctx.fillStyle = this.color;
      //Left border
      ctx.fillRect(0, 0, 10, myGameArea.canvas.height);

      //Right border
      ctx.fillRect(myGameArea.canvas.width - 10, 0, 10, myGameArea.canvas.height);

      //Top border
      ctx.fillRect(0, 0, myGameArea.canvas.width, 10);
   }

   this.platformCollide= function (platform) {
      if ((platform.x + (platform.width) > myGameArea.canvas.width - 10)
         || (platform.x < 10))
         return true;
   }

   this.getNormale = function (x, y, radius) {
      if ((x + radius) >= (myGameArea.canvas.width - 10))
         return 180;
      else if ((x - radius) <= 10)
         return 0;
      else if ((y - radius) <= 10)
         return 90;
      else
         return 0;
   }

   this.detectCollide = function (x, y, radius, direction) {
      if ((x + radius) >= (myGameArea.canvas.width - 10))
         return true;
      else if ((x - radius) <= 10) 
         return true;    
      else if ((y - radius) <= 10)
         return true;    
      else
         return false;
   }
}

function unbreakableBrick(x, y, width, height, color) {
   this.x = x;
   this.y = y;
   this.width = width;
   this.height = height;
   this.color = color;
   this.update = function () {
      ctx = myGameArea.context;
      //Unbreakable brick
      ctx.strokeStyle = this.color;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
   }

   this.getNormale = function (x, y, radius) {
      //   1 |    2   | 3
      //  --- -------- ---
      //   8 |        | 4
      //  --- -------- ---
      //   7 |    6   | 5

      //zone 1-8-7
      if (x <= this.x) {
         if (y <= this.y)
            return 225; //zone 1
         else if (y <= (this.y + height))
            return 180; //zone 8
         else
            return 135; //zone 7
      }//zone 2-6
      else if (x <= (this.x + width)) {
         if (y <= this.y)
            return 270; //zone 2
         else
            return 90; //zone 6
      }//zone 3-4-5
      else {
         if (y <= this.y)
            return 315; //zone 3
         else if (y <= (this.y + height))
            return 0; //zone 4
         else
            return 45; //zone 5
      }
   }

   this.detectCollide = function (x, y, radius, direction) {
      if (((x + radius) >= this.x)
         && ((x - radius) <= (this.x + this.width))
         && ((y + radius) >= this.y)
         && ((y - radius) <= (this.y + this.height))
      ) {
         return true;
      }
      else
         return false;
   }
}

function startGame() {
   myGamePlatform = new gamePlatform(75, 10, "red", 32 + myGameArea.width / 2, myGameArea.height - 20);
   myGameBall = new gameBall(10, "green", 0, 0, Math.floor(Math.random() * 180)+180, 0);
   myGameBall.addCollider(myGamePlatform);
   myGameDecor = new gameDecor("blue");
   myGameBall.addCollider(myGameDecor);
   myUnbreakableBricks = new Array(new unbreakableBrick(60, 60, 30, 10), new unbreakableBrick(310, 120, 30, 10), new unbreakableBrick(400, 50, 30, 10));
   myUnbreakableBricks.forEach(function (item, index, array) {
      myGameBall.addCollider(item);
   });   
   myGameArea.start();
}

function updateGameArea(timestamp) {
   if (totalLifes > 0) {
      if (myGameArea.starttime == null)
         myGameArea.starttime = timestamp;
      else
         myGameArea.time = timestamp - myGameArea.starttime;
      myGameArea.clear();
      myGamePlatform.update();
      myGameBall.update();
      myGameDecor.update();
      for (i = 0; i < myUnbreakableBricks.length; i++) {
         myUnbreakableBricks[i].update();
      }
      requestAnimationFrame(updateGameArea);
   }
   else
      myGameArea.gameover();
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

         for (i = 0; i < moveDiff; i++) {

            var test = {
               x: this.x,
               width: this.width
            };

            if (leftMove)
               test.x -= 1;
            else
               test.x += 1;

            if (!myGameDecor.platformCollide(test))
               this.x = test.x;
         }         
      }
      
      ctx = myGameArea.context;
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
   }

   this.detectCollide = function (x, y, radius, direction) {
      if ((x + radius) >= this.x && (x - radius) <= (this.x + this.width) && (y + radius) >= this.y && (y - radius) <= (this.y + this.height))
         return true;
      else
         return false;
   }

   this.getNormale = function (x, y, radius) {
      //   1 |    2   | 3
      //  --- -------- ---
      //   8 |        | 4
      //  --- -------- ---
      //   7 |    6   | 5


      //zone 1-8-7
      if (x <= this.x) {
         if (y <= this.y)
            return 225; //zone 1
         else if (y <= (this.y + height))
            return 180; //zone 8
         else
            return 135; //zone 7
      }//zone 2-6
      else if (x <= (this.x + width)) {
         if (y <= this.y)
            return 270; //zone 2
         else
            return 90; //zone 6
      }//zone 3-4-5
      else {
         if (y <= this.y)
            return 315; //zone 3
         else if (y <= (this.y + height))
            return 0; //zone 4
         else
            return 45; //zone 5
      }
   }
}

function gameBall(radius, color, x, y, direction, speed) {
   this.x = x;
   this.y = y;
   this.radius = radius;
   this.direction = direction;
   this.speed = speed;
   this.colliderList = new Array();
   this.update = function () {
      if (this.speed == 0) { //Ball originally stuck to the platform
         this.x = myGamePlatform.x + myGamePlatform.width / 2;
         this.y = myGamePlatform.y - 11;
      }
      else {
         for (i = 0; i < this.speed; i++) {
            this.x += Math.cos(this.direction * 2 * Math.PI / 360);
            this.y += Math.sin(this.direction * 2 * Math.PI / 360);
            this.collide();
            if (this.y > myGameArea.canvas.height) {
               this.speed = 0;
               myGameArea.removeLife();
            }
         }
      }
      ctx = myGameArea.context;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
   }
   this.addCollider = function (object) {
      this.colliderList.push(object);
   }
   this.collide = function () {
      for (var i = 0; i < this.colliderList.length; i++) {
         if (this.colliderList[i].detectCollide(this.x, this.y, this.radius, this.direction) == true) {
            normale = this.colliderList[i].getNormale(this.x, this.y, this.radius);

            if (this.direction > 180)
               vect = this.direction - 180;
            else
               vect = this.direction + 180;

            if (vect == normale)
               this.direction = vect;
            else
               this.direction = 2 * normale - vect;

            break;
         }
      }
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
   if (totalLifes > 0) {
      if ((e.code == "ArrowLeft") || (e.code == "ArrowRight")) {
         if (myGameArea.keycode != e.code) {
            clearPlatformMove();
            myGameArea.keycode = e.code;
            if (e.code == "ArrowLeft")
               movePlatformLeft();
            else
               movePlatformRight();
         }
      }
      else if ((e.code == "Space")) {
         myGameBall.speed = 5;
      }
   }   
}

function keyUp(e) {
   if (totalLifes > 0) {
      if (e.code == myGameArea.keycode) {
         clearPlatformMove();
         myGameArea.keycode = null;
      }
   }
}