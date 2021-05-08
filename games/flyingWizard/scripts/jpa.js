//GLOBAL VARIABLES
var title = "jpAdventure";
var myAnimation;
var mynumber = 1;
var fps = 25;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var leftPressed = false;
var upPressed = false;
var rightPressed = false;
var downPressed = false;
var firePressed = false;
var gameWidth = 1280;
var gameHeight = gameWidth / (window.innerWidth/window.innerHeight);
var gWidthRatio = innerWidth / gameWidth;
var gHeightRatio = innerHeight / gameHeight;
var c = document.getElementById("gameCanvas");
c.width = gameWidth;
c.height = gameHeight;
c.style.width = "100%";
var ctx = c.getContext("2d");
ctx.font = "bold 18px Arial";
ctx.textAlign = "center";
ctx.textBaseline="middle";

var gameScreen;

//howler sounds
var bgmusic = new Howl({
  src: ['../assets/audio/bgmusic.mp3'],
  loop: true
});
var fireSound = new Howl({
  src: ['../assets/audio/fire.mp3']
});
fireSound.volume(.3);
var clickSound = new Howl({
  src: ['../assets/audio/click.mp3']
});
var explosionSound = new Howl({
  src: ['../assets/audio/explosion.mp3']
});
var collectSound = new Howl({
  src: ['../assets/audio/collect.mp3']
});
var enemyhitSound = new Howl({
  src: ['../assets/audio/enemyhit.mp3']
});
enemyhitSound.volume(.5);

//game image objects
var GameImageSimple = function(imagefile){
	this.image = new Image();
	this.image.src = imagefile;
	this.cor1;
	this.cor2;
	this.cor3;
	this.cor4;
	/*
	note for image scaling
	wh 0 = default width & height
	wh -1 = 100% of screen
	w/h -2 = maintain aspect ratio related to one of w/h
	*/
	this.draw = function(x, y, w, h){
		var imageWidth, imageHeight, anchX, anchY;
		anchX = this.image.width/2;
		anchY = this.image.height/2;
		if(w == 0) imageWidth = this.image.width;
		else imageWidth = w;
		if(h == 0) imageHeight = this.image.height;
		else imageHeight = h;
		if(w == -1){
			imageWidth = this.image.width * (gameWidth/this.image.width);
			anchX = gameWidth/2;
		}
		if(h == -1){
			imageHeight = this.image.height * (gameHeight/this.image.height);
			anchY = gameHeight/2;
		}
		if(w == -2){
			imageWidth = (gameHeight/this.image.height)*this.image.width;
			anchX = imageWidth/2;
		}
		if(h == -2){
			imageHeight = (gameWidth/this.image.width)*this.image.height;
			anchY = imageHeight/2;
		}
		ctx.drawImage(this.image, x-anchX, y-anchY, imageWidth, imageHeight);
		this.cor1 = x-anchX;
		this.cor2 = y-anchY;
		this.cor3 = x+anchX;
		this.cor4 = y+anchY;
		
		/*
		cor1 = leftX
		cor2 = UpY
		cor3 = rightX
		cor4 = bottomY
		*/
	}
}

//animated game image objects
var GameImageAnimated = function(imagefile, divider){
	this.image = new Image();
	this.image.src = imagefile;
	this.cor1;
	this.cor2;
	this.cor3;
	this.cor4;
	this.currentAnimFrame = 0;
	this.frameCounter = 0;
	this.repCounter = 0;
	
	this.draw = function(stillOrAnim, x, y, startFrame, endFrame, spriteFps, rep){
		var imageWidth, imageHeight, anchX, anchY, frameCounts;
		imageWidth = this.image.width/divider;
		imageHeight = this.image.height;
		anchX = imageWidth/2;
		anchY = imageHeight/2;

		if(stillOrAnim == "still") ctx.drawImage(this.image, startFrame * imageWidth - imageWidth, 0, imageWidth, imageHeight, x-anchX, y-anchY, imageWidth, imageHeight);
		else if(stillOrAnim == "anim"){
			if(rep == 0){
				if(this.currentAnimFrame < startFrame) this.currentAnimFrame = startFrame;
				if(this.currentAnimFrame > endFrame) this.currentAnimFrame = startFrame;
				ctx.drawImage(this.image, imageWidth * this.currentAnimFrame - imageWidth, 0, imageWidth, imageHeight, x-anchX, y-anchY, imageWidth, imageHeight);
				this.frameCounter += spriteFps/fps;
				if(this.frameCounter > 1){
					this.frameCounter = 0;
					this.currentAnimFrame += 1;
				}
			}else if(rep > 0){
				if(this.repCounter < rep){
					if(this.currentAnimFrame < startFrame) this.currentAnimFrame = startFrame;
					if(this.currentAnimFrame > endFrame) this.currentAnimFrame = startFrame;
					ctx.drawImage(this.image, imageWidth * this.currentAnimFrame - imageWidth, 0, imageWidth, imageHeight, x-anchX, y-anchY, imageWidth, imageHeight);
					this.frameCounter += spriteFps/fps;
					if(this.frameCounter > 1){
						this.frameCounter = 0;
						this.currentAnimFrame += 1;
					}
					if(this.currentAnimFrame >= endFrame - startFrame + 1) this.repCounter++;
					if(this.repCounter >= rep) return true;
				}
			}
		}
		
		this.cor1 = x-anchX;
		this.cor2 = y-anchY;
		this.cor3 = x+anchX;
		this.cor4 = y+anchY;
	}
}

var btnUp = new GameImageAnimated("../assets/images/btn-up.png", 2);
var btnDown = new GameImageAnimated("../assets/images/btn-down.png", 2);
var btnLeft = new GameImageAnimated("../assets/images/btn-left.png", 2);
var btnRight = new GameImageAnimated("../assets/images/btn-right.png", 2);
var btnFire = new GameImageAnimated("../assets/images/wand.png", 2);

var bullet = new GameImageAnimated("../assets/images/jpBullet.png", 4);
var bulletMetal = new GameImageAnimated("../assets/images/jpBulletMetal.png", 1);
var bulletMG = new GameImageAnimated("../assets/images/jpBulletMG.png", 1);

var jetpacker = new GameImageAnimated("../assets/images/wizard.png", 9);
var weaponUps = new GameImageAnimated("../assets/images/weaponUps.png", 5);
var explosion = new GameImageAnimated("../assets/images/explosion.png", 5);

var simpleEnemy = new GameImageAnimated("../assets/images/bat.png", 1);
var simpleEnemy2 = new GameImageAnimated("../assets/images/ghost.png", 1);
var enemyBullets = new GameImageAnimated("../assets/images/enemyBullets.png", 1);

var textButtons = new GameImageAnimated("../assets/images/textButtons.png", 3);
var titleImage = new GameImageAnimated("../assets/images/title.png", 1);

var floor = new GameImageAnimated("../assets/images/floor.png", 1);
var bg = new GameImageAnimated("../assets/images/back2.png", 1);

var firingAllowed = true;

var jetPacker;

var playerLevel;
var playerHighScore;
if(localStorage.getItem(title+"HighScore") === null){
	localStorage.setItem(title+"HighScore", 0);
}
playerHighScore = localStorage.getItem(title+"HighScore");
var playerCurrentScore;
var gamePlayCounter;
var gamePlayCounterLimit;

var weaponUpTimeLimit;
var tempWeaponUpCounter;
var weaponUp;

var enemies1;
var enemies1_aprnce_interval;
var enemies1_counter;
var enemies1_bullets;
var enemies1_firing_interval; 

var enemies2;
var enemies2_aprnce_interval;
var enemies2_counter;
var enemies2_bullets;
var enemies2_firing_interval; 

//load logo and start the game after it
var zklogo = new GameImageSimple("../assets/images/spellbind.jpg");
zklogo.image.onload = function(){
	startScene("start");
}

function startScene(x){
	switch (x) {
		case "start" :
			$("#blackScreen").fadeIn(500, function(){
				gameScreen = "start";
				zklogo.draw(gameWidth/2, gameHeight/2, 0, 0);
				var tempInterv = setTimeout(function(){
					clearInterval(tempInterv);
					startScene("mainmenu");
				}, 2000);
			});
			$("#blackScreen").fadeOut(500);
			break;
		case "gameover" :
			stop();
			$("#blackScreen").fadeIn(500, function(){	
				gameScreen = "gameover";
				ctx.clearRect(0, 0, gameWidth, gameHeight);
				ctx.fillStyle = "#cfecff";
				ctx.fillRect(0, 0, gameWidth, gameHeight);
				ctx.fillStyle = "black";
				ctx.textAlign = "center";
				textButtons.draw("still", gameWidth/2, gameHeight/2 + 50, 3, 0, 0, 0);
				titleImage.draw("still", gameWidth/2, gameHeight/2 - 50, 1, 0, 0, 0);
			});
			$("#blackScreen").fadeOut(500);
			break;
		case "mainmenu" :
			stop();
			$("#blackScreen").fadeIn(500, function(){	
				gameScreen = "gameover";
				ctx.clearRect(0, 0, gameWidth, gameHeight);
				ctx.fillStyle = "#cfecff";
				ctx.fillRect(0, 0, gameWidth, gameHeight);
				ctx.fillStyle = "black";
				ctx.textAlign = "center";
				textButtons.draw("still", gameWidth/2, gameHeight/2 + 50, 1, 0, 0, 0);
				titleImage.draw("still", gameWidth/2, gameHeight/2 - 50, 1, 0, 0, 0);
			});
			$("#blackScreen").fadeOut(500);
			break;
		case "adventure" :
			$("#blackScreen").fadeIn(500, function(){
				bgmusic.play();
				reset();
				gameScreen = "adventure";
				loopDGame();
			});
			$("#blackScreen").fadeOut(500);
			break;
	}
}

function loopDGame() {
	
	myAnimation = requestAnimationFrame(loopDGame);
	
	now = Date.now();
    delta = now - then;
     
    if (delta > interval) {
		then = now - (delta % interval);
		//update codes here
		update();
	}
}

function stop(){
	cancelAnimationFrame(myAnimation);
}

function update(){	
	ctx.clearRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = "#cfecff";
	ctx.fillRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = "black";
	
	generateBg();
	generateFloor();
	generateWeaponUp();
	generateEnemies1();
	generateEnemies2();
	moveJetPacker();
	showWeaponStatus();
	
	updateLevel();
	
	if(upPressed) btnUp.draw("still", 200, gameHeight - 250, 2, 0, 0, 0);
	else btnUp.draw("still", 200, gameHeight - 250, 1, 0, 0, 0);
	if(downPressed) btnDown.draw("still", 200, gameHeight - 100, 2, 0, 0, 0);
	else btnDown.draw("still", 200, gameHeight - 100, 1, 0, 0, 0);
	if(rightPressed) btnRight.draw("still", 325, gameHeight - 175, 2, 0, 0, 0);
	else btnRight.draw("still", 325, gameHeight - 175, 1, 0, 0, 0);
	if(leftPressed) btnLeft.draw("still", 75, gameHeight - 175, 2, 0, 0, 0);
	else btnLeft.draw("still", 75, gameHeight - 175, 1, 0, 0, 0);
	if(firePressed) btnFire.draw("still", gameWidth - 100, gameHeight - 100, 2, 0, 0, 0);
	else btnFire.draw("still", gameWidth - 100, gameHeight - 100, 1, 0, 0, 0);
}

$(document).keydown(function(e){
	if (e.keyCode == 37) { 
		leftPressed = true;
		return false;
	}
	if (e.keyCode == 38) { 
		upPressed = true;
		return false;
	}
	if (e.keyCode == 39) { 
		rightPressed = true;
		return false;
	}
	if (e.keyCode == 40) { 
		downPressed = true;
		return false;
	}
	if (e.keyCode == 32) { 
		firePressed = true;
		return false;
	}
});

$(document).keyup(function(e){
	if (e.keyCode == 37) { 
		leftPressed = false;
		return false;
	}
	if (e.keyCode == 38) { 
		upPressed = false;
		return false;
	}
	if (e.keyCode == 39) { 
		rightPressed = false;
		return false;
	}
	if (e.keyCode == 40) { 
		downPressed = false;
		return false;
	}
	if (e.keyCode == 32) { 
		firePressed = false;
		return false;
	}
});

document.getElementById("gameCanvas").addEventListener('mousedown', function(e){
	var cursorX = e.clientX/gWidthRatio;
	var cursorY = e.clientY/gHeightRatio;
	if(gameScreen == "mainmenu") if(checkClick(cursorX, cursorY, textButtons)){
		clickSound.play();
		startScene("adventure");
	}
	if(gameScreen == "adventure") if(checkClick(cursorX, cursorY, textButtons)){
		clickSound.play();
		resume();
	}
	if(gameScreen == "gameover") if(checkClick(cursorX, cursorY, textButtons)){
		clickSound.play();
		startScene("adventure");
	}
}, false);

document.getElementById("gameCanvas").addEventListener('touchstart', function(e){
	var userTouches = e.changedTouches;
	for(var j = 0; j < userTouches.length; j++){
		switch (gameScreen){
			case "adventure" :
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnUp)) upPressed = true;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnDown)) downPressed = true;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnLeft)) leftPressed = true;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnRight)) rightPressed = true;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnFire)) firePressed = true;
				break;
		}
	}	
}, false);

document.getElementById("gameCanvas").addEventListener('touchend', function(e){
	var userTouches = e.changedTouches;
	for(var j = 0; j < userTouches.length; j++){
		switch (gameScreen){
			case "adventure" :
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnUp)) upPressed = false;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnDown)) downPressed = false;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnLeft)) leftPressed = false;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnRight)) rightPressed = false;
				if(checkClick(userTouches[j].pageX/gWidthRatio, userTouches[j].pageY/gHeightRatio, btnFire)) firePressed = false;
				break;
		}
	}
	if(e.touches.length == 0){
		leftPressed = false;
		upPressed = false;
		rightPressed = false;
		firePressed = false;
	}
}, false);

//click collision detection
function checkClick(x, y, clickable){
	if(x > clickable.cor1 && y > clickable.cor2 && x < clickable.cor3 && y < clickable.cor4){
		return true;
	}
	return false;
}

//image to image collision detection
function checkClick2(firstImage, secondImage){
	var fi = [];
	fi[0] = {"x" : firstImage.cor1, "y" : firstImage.cor2};
	fi[1] = {"x" : firstImage.cor1, "y" : firstImage.cor4};
	fi[2] = {"x" : firstImage.cor2, "y" : firstImage.cor2};
	fi[3] = {"x" : firstImage.cor2, "y" : firstImage.cor4};
	for(var i = 0; i < 4; i++){
		if(checkClick(fi[i].x, fi[i].y, secondImage)) return true; 
	}
	return false;
}

//check bullet collision
function checkBulletHit(bullet, bulletIndex){
		if(enemies1_bullets.length > 0){
			if(bullet == enemies1_bullets){
				for(var eb = 0; eb < enemies1_bullets.length; eb++){
					if(checkClick(bullet[eb].posX, bullet[eb].posY, jetpacker)){
						enemies1_bullets.splice(eb, 1);
						eb -= 1;
						return true;
					}
				}
			}
		}
		if(enemies2_bullets.length > 0){
			if(bullet == enemies2_bullets){
				for(var eb = 0; eb < enemies2_bullets.length; eb++){
					if(checkClick(bullet[eb].posX, bullet[eb].posY, jetpacker)){
						enemies2_bullets.splice(eb, 1);
						eb -= 1;
						return true;
					}
				}
			}
		}
		if(enemies1.length > 0 || enemies2.length > 0){
			if(bullet == jetPacker.bullets){			
				for(var enm = 0; enm < enemies1.length; enm++){
					if(bullet[bulletIndex].posX > enemies1[enm].posX - enemies1[enm].disFromCenter && bullet[bulletIndex].posY > enemies1[enm].posY - enemies1[enm].disFromCenter && bullet[bulletIndex].posX < enemies1[enm].posX + enemies1[enm].disFromCenter && bullet[bulletIndex].posY < enemies1[enm].posY + enemies1[enm].disFromCenter){
						enemies1[enm].health -= bullet[bulletIndex].damagePw;
						explosion.draw("still", bullet[bulletIndex].posX, bullet[bulletIndex].posY, 1, 0, 0, 0);
						if(enemies1[enm].health < 1){
							explosion.draw("still", enemies1[enm].posX, enemies1[enm].posY, 2, 0, 0, 0);
							explosion.draw("still", enemies1[enm].posX, enemies1[enm].posY, 3, 0, 0, 0);
							playerCurrentScore += 100;
							enemies1.splice(enm, 1);
							enm -= 1;
							explosionSound.play();
						}
						return true;
					}
				}
				for(var enm = 0; enm < enemies2.length; enm++){
					if(bullet[bulletIndex].posX > enemies2[enm].posX - enemies2[enm].disFromCenter && bullet[bulletIndex].posY > enemies2[enm].posY - enemies2[enm].disFromCenter && bullet[bulletIndex].posX < enemies2[enm].posX + enemies2[enm].disFromCenter && bullet[bulletIndex].posY < enemies2[enm].posY + enemies2[enm].disFromCenter){
						enemies2[enm].health -= bullet[bulletIndex].damagePw;
						explosion.draw("still", bullet[bulletIndex].posX, bullet[bulletIndex].posY, 1, 0, 0, 0);
						if(enemies2[enm].health < 1){
							explosion.draw("still", enemies2[enm].posX, enemies2[enm].posY, 2, 0, 0, 0);
							explosion.draw("still", enemies2[enm].posX, enemies2[enm].posY, 3, 0, 0, 0);
							playerCurrentScore += 300;
							enemies2.splice(enm, 1);
							enm -= 1;
							explosionSound.play();
						}
						return true;
					}
				}
			}
		}
	return false;
};