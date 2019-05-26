﻿window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var myGamePlatform;
var myGameBall;
var myGameDecor;
var myBricks;

var myGameArea = {
   starttime : null,
   time: 0,
   keycode: null,
   canvas: document.createElement("canvas"),
   start: function (width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
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

function gameDecor(color, borderWidth) {
   this.color = color;
   this.borderWidth = borderWidth;
   this.update= function () {
      ctx = myGameArea.context;
      ctx.fillStyle = this.color;
      //Left border
      ctx.fillRect(0, 0, this.borderWidth, myGameArea.canvas.height);

      //Right border
      ctx.fillRect(myGameArea.canvas.width - this.borderWidth, 0, this.borderWidth, myGameArea.canvas.height);

      //Top border
      ctx.fillRect(0, 0, myGameArea.canvas.width, this.borderWidth);
   }

   this.platformCollide= function (platform) {
      if ((platform.x + (platform.width) > myGameArea.canvas.width - this.borderWidth)
         || (platform.x < this.borderWidth))
         return true;
   }

   this.getNormale = function (x, y, radius) {
      if ((x + radius) >= (myGameArea.canvas.width - this.borderWidth))
         return 180;
      else if ((x - radius) <= this.borderWidth)
         return 0;
      else if ((y - radius) <= this.borderWidth)
         return 90;
      else
         return 0;
   }

   this.detectCollide = function (x, y, radius, direction) {
      if ((x + radius) >= (myGameArea.canvas.width - this.borderWidth))
         return true;
      else if ((x - radius) <= this.borderWidth) 
         return true;    
      else if ((y - radius) <= this.borderWidth)
         return true;    
      else
         return false;
   }
   
   this.isBreakable = function() {
      return false;
   }
   this.breakObject = function() {
   }
}

function brick(breakable, x, y, width, height, color) {
   this.breakable = breakable;
   this.broken = false;
   this.x = x;
   this.y = y;
   this.width = width;
   this.height = height;
   this.color = color;
   this.update = function () {
      ctx = myGameArea.context;
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.color;
      ctx.strokeRect(this.x + (ctx.lineWidth / 2), this.y + (ctx.lineWidth / 2), this.width - ctx.lineWidth, this.height - ctx.lineWidth);
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
   
   this.isBreakable = function() {
      return this.breakable;
   }
   this.breakObject = function() {
      this.broken = true;
   }
}

function startGame() {
   var width = 500;
   var height = 270;
   var borderWidth = 10;
   
   myGamePlatform = new gamePlatform(75, 10, "red", 225, 240);
   myGameBall = new gameBall(10, "green", 100, 100, Math.floor(Math.random() * 360), 5);
   myGameBall.addCollider(myGamePlatform);
   myGameDecor = new gameDecor("blue", borderWidth);
   myGameBall.addCollider(myGameDecor);
   
   myBricks = generateBricks(borderWidth, borderWidth, width - (2 * borderWidth), height / 4, 0.9);
   myBricks.forEach(function (item, index, array) {
      myGameBall.addCollider(item);
   });   
   myGameArea.start(width, height);
}

function generateBricks(topPosition, leftPosition, totalWidth, totalHeight, breakableProportion) {
   var breakableBrickColorList = ["green", "blue", "red"];
   var unbreakableBrickColor = "black";
   var brickWidth = 30;
   var brickHeight = 10;
   var maxNbColumns = totalWidth / brickWidth;
   var maxNbRows = totalHeight / brickHeight;
   
   var bricks = new Array();
   for (var i = 0; i < maxNbColumns; i++) {
      for (var j = 0; j < maxNbRows; j++) {
         var isBreakable = (Math.random() < breakableProportion);
         var color = (isBreakable ? breakableBrickColorList[Math.floor(Math.random() * breakableBrickColorList.length)] : unbreakableBrickColor);
         bricks.push(new brick(isBreakable, topPosition + (i * brickWidth), leftPosition + (j * brickHeight), brickWidth, brickHeight, color))
      }
   }
   
   return bricks;
}

function updateGameArea(timestamp) {
   if (myGameArea.starttime == null)
      myGameArea.starttime = timestamp;
   else
      myGameArea.time = timestamp - myGameArea.starttime;
   myGameArea.clear();
   myGamePlatform.update();
   myGameBall.update();
   myGameDecor.update();
   for (i = 0; i < myBricks.length; i++) {
      if (myBricks[i].broken) {
         this.myBricks.splice(i, 1);
         i--;
      }
      myBricks[i].update();
   }
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
   
   this.isBreakable = function() {
      return false;
   }
   this.breakObject = function() {
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
      this.x += Math.cos(this.direction * 2 * Math.PI / 360) * this.speed;
      this.y += Math.sin(this.direction * 2 * Math.PI / 360) * this.speed;
      ctx = myGameArea.context;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      this.collide();
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

            if (this.colliderList[i].isBreakable()) {
               this.colliderList[i].breakObject();
               this.colliderList.splice(i, 1);
               i--;
            }
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
}

function keyUp(e) {
   if (e.code == myGameArea.keycode) {
      clearPlatformMove();
      myGameArea.keycode = null;
   }
}