class shooter extends Phaser.Scene {
        curve;
        path;
    constructor() {
        super("shooter");


        this.my = {sprite: {}};

        //set default values for player cordinates
        this.screenWidth = config.width;
        this.screenHeight = config.height;
        this.playerX = 750;
        this.playerY = 50;
        this.canShoot = true;
        this.cannonYOffsett = 60;
        this.cannonBallScale = 1;
        this.maxPlayerHP = 5;
        this.currentHP = 5;
        this.upgradeToggle = false;
        this.imtired = 0;
        this.playerScore = 0;

        //Create cannon Array
        this.my.sprite.cannon = [];  
        this.maxcannons = 8;           // Don't create more than this many cannons
        this.cannonCooldown = 60;        // Number of update() calls to wait before making a new cannon
        this.cannonCooldownCounter = 0;

        //Enemy variables
        this.my.sprite.enemyCannon = [];    //Arrays
        this.my.sprite.enemyShips = [];     // ^^
        this.enemyCount = 2;        //Variables for rounds
        this.enemyVisibleCount = 1; // ^^
        this.enemySpawned = 0;  //Keep track of during round variables
        this.enemyAlive = 0;    // ^^
        this.maxEnemyVisibleCount = 15;     //Variables for Arrays
        this.maxEnemyCannonBallCount = 50;  // ^^
        this.bigEnemyShipCount = 0;
        this.bigEnemyShipSpawned = 0;



    }

    preload() {
        this.load.setPath("./assets/");
        //Player Images
        this.load.image("playerBoat", "ship.png");
        this.load.image("playerBoatDmg", "ship_dmgd.png");
        this.load.image("playerBoatHurt", "ship_hurt.png");
        //Cannon Ball
        this.load.image("cannonBall", "cannonBall.png");
        this.load.image("enemyCannon", "redCannonBall.png");
        //EnemyImages
        this.load.image("enemyShip0", "enemyShip.png");
        this.load.image("enemyShip1", "enemyShipDmg1.png");
        this.load.image("bigEnemyShip0", "bigEnemyShip.png");
        this.load.image("bigEnemyShip1", "bigEnemyDmg1.png");
        this.load.image("bigEnemyShip2", "bigEnemyDmg2.png");
        //Explosion
        this.load.image("explosion0", "explosion3.png");
        this.load.image("explosion1", "explosion2.png");
        this.load.image("explosion2", "explosion1.png");
        //SFX
        this.load.audio("hitSFX","hit.mp3");
        this.load.audio("victorySFX","victory.mp3");
        this.load.audio("splashSFX","splash.mp3");


    }


    create() {
        let my = this.my; 
        let scenevar = this;

        my.sprite.healthText = this.add.text(25,25,"Health: "+this.currentHP,{
            color: "Crimson",
            fontSize: '40px',
            strokeThickness: 0.3,
            stroke: "Black"
        });

        this.updateEnemiesLeft = function() {
            if (my.sprite.enemysLeftText) {
                my.sprite.enemysLeftText.destroy(true);
            }
            my.sprite.enemysLeftText = scenevar.add.text(scenevar.screenWidth-425,25,"Enemies Left: "+((scenevar.enemyCount-scenevar.enemySpawned)+scenevar.enemyAlive+(scenevar.bigEnemyShipCount-scenevar.bigEnemyShipSpawned)),{
            color: "Crimson",
            fontSize: '40px',
            strokeThickness: 0.3,
            stroke: "Black"
        });
    }
        this.updateEnemiesLeft();


        
        this.updatePlayerScore = function() {
            if (my.sprite.playerScore) {
                my.sprite.playerScore.destroy(true);
            }
            my.sprite.playerScore = scenevar.add.text(scenevar.screenWidth-300,75,"Score: "+this.playerScore,{
            color: "Gold",
            fontSize: '40px',
            strokeThickness: 0.3,
            stroke: "Black"
        });
    }
        this.updatePlayerScore();
        //Create player
        my.sprite.player = this.add.sprite(this.playerX, this.playerY, "playerBoat").setOrigin(.5,.5);
        my.sprite.player.damaged = this.add.sprite(this.playerX, this.playerY, "playerBoatHurt").setOrigin(.5,.5);
        my.sprite.player.hurt = this.add.sprite(this.playerX, this.playerY, "playerBoatDmg").setOrigin(.5,.5);
        my.sprite.player.damaged.setVisible(false);
        my.sprite.player.hurt.setVisible(false);
        

        //Create the cannonballs.
        for (let i = 0; i < this.maxcannons; i++) {
            // create a sprite which is offscreen and invisible
            my.sprite.cannon.push(this.add.sprite(-100, -100, "cannonBall").setOrigin(.5,.5));
            my.sprite.cannon[i].visible = false;
            my.sprite.cannon[i].keepTrack = i;
            my.sprite.cannon[i].explosion0 = this.add.sprite(my.sprite.cannon[i].x,my.sprite.cannon[i].y,"explosion0");
            my.sprite.cannon[i].explosion1 = this.add.sprite(my.sprite.cannon[i].x,my.sprite.cannon[i].y,"explosion1");
            my.sprite.cannon[i].explosion2 = this.add.sprite(my.sprite.cannon[i].x,my.sprite.cannon[i].y,"explosion2");
            my.sprite.cannon[i].explosion0.visible = false;
            my.sprite.cannon[i].explosion1.visible = false;
            my.sprite.cannon[i].explosion2.visible = false;        }
        for (let i = 0; i < this.maxEnemyCannonBallCount; i++) {
            //Same thing but for enemy cannonballs
            my.sprite.enemyCannon.push(this.add.sprite(this.screenWidth/2, this.screenWidth+200, "enemyCannon").setOrigin(.5,.5));
            my.sprite.enemyCannon[i].visible = false;       }
        
        //Setup keybinds
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);        
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);        
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

        //Change player speed
        this.playerSpeed = 8;
        this.ballSpeed = 3.3;

        //Random X Function for enemy - NEEDS ADJUSTING
        this.randomX = function randomXSpawn() {
            return Math.floor(Math.random() * scenevar.screenWidth);
        }
        //Create a path and return it.
        this.enemyPathGenerator = function enemyPathGenerator(x,y) {
            let verticle = 60;

            let destination = [];
            if (y < 200){   //Ram the player!
                destination = [x,y,x+30,x-verticle/2,x-15,x-15-verticle/2,my.sprite.player.x,my.sprite.player.y-70,]; }
            else if (x > scenevar.screenWidth-100){ //We're too far right!
                destination = [x,y,x+40,y-verticle,x-140,y-verticle,x-140,y-verticle-15]; }
            else if (x < 100) { //We're too far left!
                destination = [x,y,x-40,y-verticle,x+140,y-verticle,x+140,y-verticle-15]; }
            else if (x < my.sprite.player.x+100 && x > my.sprite.player.x-100){
                destination = [x,y,x-70,y-verticle,my.sprite.player.x,y-verticle-15,my.sprite.player.x,y-verticle-30];
            }
            else if (Math.random() < 0.5) {      //General move forward. 50/50 if turn left or right.
                destination = [x,y,x-70,y-verticle,x+60,y-verticle-15,x+60,y-verticle-30]; }
            else destination = [x,y,x+70,y-verticle,x-60,y-verticle-15,x-60,y-verticle-30];
            //Create the phaser curve
            let path = new Phaser.Curves.Spline(destination);
            //Return Curve.
            return path;
        }

        this.bigEnemyPathGenerator = function bigEnemyPathGenerator(x,y) {
            let verticle = 70;

            let destination = [];
            if (y < 200){   //Ram the player!
                destination = [x,y,x+60,x-verticle/2,x-30,x-30-verticle/2,my.sprite.player.x,my.sprite.player.y-70,]; }
            else if (x > scenevar.screenWidth-100){ //We're too far right!
                destination = [x,y,x+70,y-verticle,x-240,y-verticle,x-140,y-verticle-15]; }
            else if (x < 100) { //We're too far left!
                destination = [x,y,x-70,y-verticle,x+240,y-verticle,x+140,y-verticle-15]; }
            else if (x < my.sprite.player.x+100 && x > my.sprite.player.x-100){
                destination = [x,y,x-90,y-verticle,my.sprite.player.x,y-verticle-15,my.sprite.player.x,y-verticle-30];
            }
            else if (Math.random() < 0.5) {      //General move forward. 50/50 if turn left or right.
                destination = [x,y,x-140,y-verticle,x+120,y-verticle-15,x+120,y-verticle-30]; }
            else destination = [x,y,x+140,y-verticle,x-120,y-verticle-15,x-120,y-verticle-30];
            //Create the phaser curve
            let path = new Phaser.Curves.Spline(destination);
            //Return Curve.
            return path;
        }



        //Create big enemy ship (we only use 1)
        let tempRandomX = this.randomX;
        my.sprite.bigEnemyShip = this.add.follower(this.bigEnemyPathGenerator(tempRandomX,this.screenHeight-50),tempRandomX,this.screenHeight-50,"bigEnemyShip0").setOrigin(.5,.5);
        my.sprite.bigEnemyShip.setScale(2);
        my.sprite.bigEnemyShip.visible = false;

        this.enemyDeathPath = function enemyDeathPath() {
            let destinations = [0,0, this.randomX, this.screenHeight-125];
            let path = new Phaser.Curves.Spline(destinations);
            return path;
        }

        // Create enemy ship sprites.
        for (let i = 0; i < this.maxEnemyVisibleCount; i++){
            let x = this.randomX();
            my.sprite.enemyShips.push(this.add.follower(this.enemyPathGenerator(x,this.screenHeight-100), x , this.screenHeight-100, "enemyShip0").setOrigin(.5,.5));
            my.sprite.enemyShips[i].visible = false;
            my.sprite.enemyShips[i].deathShip = this.add.sprite(my.sprite.enemyShips[i].x,my.sprite.enemyShips[i].y,"enemyShip1");
            my.sprite.enemyShips[i].deathShip.visible = false;
        }

        this.runCollisionCheck = (spriteA,spriteB) => {
            const boundsA = spriteA.getBounds();
            const boundsB = spriteB.getBounds();

            return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
        }

        this.runStartFollow = function runStartFollow(target,x,y) {
            //Create new path. 
            target.path = scenevar.enemyPathGenerator(x,y);
            target.path.endX = target.path.points[3].x;
            target.path.endY = target.path.points[3].y;
            target.startFollow({
                from: 0,
                to: 1,
                delay: 1,
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: false,
                rotateToPath: true,
                rotationOffset: -90
                
            });


        }

        this.runBigStartFollow = function runStartFollow(target,x,y) {
            //Create new path. 
            target.path = scenevar.bigEnemyPathGenerator(x,y);
            target.path.endX = target.path.points[3].x;
            target.path.endY = target.path.points[3].y;
            target.startFollow({
                from: 0,
                to: 1,
                delay: 1,
                duration: 3000,
                ease: 'Sine.easeInOut',
                yoyo: false,
                rotateToPath: true,
                rotationOffset: -90
                
            });


        }


        this.displayUpgradeText = () => {
            if (!my.sprite.upgradeText){
            my.sprite.upgradeText = this.add.text(this.screenWidth/2-400,this.screenHeight/2-300,"Press a key for upgrade!\n1. Full Heal\n2. Fire Rate Increase\n3. Move Speed Increase",{
                color: "Red",
                fontSize: '60px',
                strokeThickness: 0.4,
                stroke: "Black"
            });
        }
            scenevar.sound.play("victorySFX");
            my.sprite.upgradeText.visible = true;


        }
        

        this.destroyUpgradeText = () => {
            if (my.sprite.upgradeText.visible){
                my.sprite.upgradeText.visible = false;
            }
        }

        this.hideEverything = () => {
            for (let cannon of my.sprite.cannon){
                cannon.setVisible(false);
                cannon.hitEnemy = false;
                cannon.explosion0.setVisible(false);
                cannon.explosion1.setVisible(false);
                cannon.explosion2.setVisible(false);
            }
            for (let ships of my.sprite.enemyShips){
                ships.setVisible(false);
                ships.noDuplicates = false;
                ships.deathShip.setVisible(false);
            }
            for (let enemyBall of my.sprite.enemyCannon){
                enemyBall.setVisible(false);
            }
        }

        //update health
        this.updateHealth = function updateHealth() {
            my.sprite.healthText.destroy(true);

            if (this.currentHP <= 0){
                //Lose Game!
                //For now just adds text.
                this.hideEverything();
                my.sprite.gameOver = this.add.text(this.screenWidth/2, this.screenHeight/2, "GAME OVER", {
                    color: "Crimson",
                    fontSize: '100px',
                    strokeThickness: 0.5,
                    stroke: "Black"
                })
            }

            if (this.currentHP < 2){
                my.sprite.player.setVisible(false);
                my.sprite.player.damaged.setVisible(false);
                my.sprite.player.hurt.setVisible(true);
            }
            else if (this.currentHP < 4) {
                my.sprite.player.setVisible(false);
                my.sprite.player.damaged.setVisible(true);
            }
            else if (!my.sprite.player.visible) {
                my.sprite.player.setVisible(true);
                my.sprite.player.damaged.setVisible(false);
                my.sprite.player.hurt.setVisible(false);
            }


            //Update HP Top Left.
            my.sprite.healthText = this.add.text(25,25,"Health: "+this.currentHP,{
                color: "Crimson",
                fontSize: '40px',
                strokeThickness: 0.3,
                stroke: "Black"
            });

        };

        

        document.getElementById('description').innerHTML = '<h2>PirateGame.js</h2><br>Movement: A & D <br>Shoot: Space <br>Upgrades: 1, 2, 3';
    }


    update(){
        let my = this.my;
        let scenevar = this;
        this.cannonCooldownCounter--; //Counting down on reload.

        if (!this.upgradeToggle && !my.sprite.gameOver){

        //If A is pressed | Movement
        if (this.aKey.isDown){
            //If D is not pressed | Movement
            if (!this.dKey.isDown){
                //
                if (my.sprite.player.x > 20){
                this.playerX -= this.playerSpeed;
                my.sprite.player.setX(this.playerX);
                my.sprite.player.damaged.setX(this.playerX);
                my.sprite.player.hurt.setX(this.playerX);
            }}
        }
        //If D is pressed | Movement
        else if (this.dKey.isDown){
            if (my.sprite.player.x < this.screenWidth-20){
            this.playerX += this.playerSpeed;
            my.sprite.player.setX(this.playerX);
            my.sprite.player.damaged.setX(this.playerX);
            my.sprite.player.hurt.setX(this.playerX);
        }}
    
        //Fire Cannonball
        if (this.spaceKey.isDown) {
            if (this.cannonCooldownCounter < 0) {
                // Check for an available cannon
                for (let cannon of my.sprite.cannon) {
                    // If the cannon is invisible, it's available
                    if (!cannon.visible && !cannon.hitEnemy) {
                        cannon.x = my.sprite.player.x;
                        cannon.y = my.sprite.player.y+this.cannonYOffsett - (cannon.displayHeight/2);
                        cannon.setVisible(true);
                        cannon.theScale = 1;
                        cannon.hitEnemy = false;
                        cannon.setScale(cannon.theScale);
                        cannon.playAudio = true;
                        this.cannonCooldownCounter = this.cannonCooldown;
                        break;    // Exit the loop, so we only activate one cannon at a time
                    }}}}
        

        //Spawn Enemy
        if (this.enemyAlive < this.enemyVisibleCount) {
            if (this.enemySpawned < this.enemyCount) {
                // Check for an available enemy
                for (let enemy of my.sprite.enemyShips) {
                    // If the enemy is invisible, it's available
                    if ((!enemy.visible) && (!enemy.deathShip.visible) && !(enemy.noDuplicates)) {
                        enemy.gameReady = false;
                        enemy.setX(this.randomX());
                        enemy.setY(scenevar.screenHeight-125);
                        enemy.setVisible(true);
                        enemy.path = this.enemyPathGenerator(enemy.x,enemy.y);
                        enemy.path.endX = enemy.path.points[3].x
                        enemy.path.endY = enemy.path.points[3].y
                        enemy.mode = "move";
                        enemy.dying = false;
                        enemy.noDuplicates = true;
                        scenevar.enemySpawned++;
                        scenevar.enemyAlive++;
                        enemy.countdown = Math.floor(Math.random() * 120);
                        break;    // Exit the loop, so we only activate one enemy at a time
                    }}}}


        //Enemy AI Behavior
        for (let enemy of my.sprite.enemyShips){
            if (enemy.visible){
                enemy.countdown--;
                if (enemy.mode == "move"){
                    if (enemy.countdown < 0) {
                        enemy.gameReady = true;
                        this.runStartFollow(enemy,enemy.x,enemy.y)
                        enemy.mode = "moving";
                    }
                }
                else if (enemy.mode == "moving"){
                    //TODO FIX THIS. maybe figure out onComplete()
                    if ((enemy.x == enemy.path.endX) && (enemy.y == enemy.path.endY)){
                        // enemy.stopFollow();
                        // enemy.setRotation(135);
                        // enemy.setX(enemy.path.endX);
                        // enemy.setY(enemy.path.endY);
                        //Cool we are at end location. Now shoot. 
                        enemy.mode = "shoot";
                    }
                    if (scenevar.runCollisionCheck(enemy,my.sprite.player)){
                        scenevar.currentHP -= 5;    //Subtract 5 HP.
                        enemy.setVisible(false);
                        scenevar.updateHealth();
                    }
                }
                else if (enemy.mode == "shoot"){
                    for (let cannon of my.sprite.enemyCannon) {
                        // If the cannon is invisible, it's available
                        if (!cannon.visible) {
                            //Set cannon X and Y and set Visible.
                            scenevar.playerScore++;
                            scenevar.updatePlayerScore();
                            cannon.x = enemy.x;
                            cannon.y = enemy.y-40;
                            cannon.setVisible(true);
                            //Set mode back to move with a 3 second delay
                            enemy.countdown = 180;
                            enemy.mode = "move";
                            break;
                        }
                    }
                }

                if (enemy.y < -10){
                    enemy.setVisible(false);
                    this.playerSCore += 10
                    this.updatePlayerScore();
                    scenevar.enemyAlive--;
                }



            }
        }
        //Spawn Big Enemy Ships
        if (this.bigEnemyShipSpawned < this.bigEnemyShipCount){
            if (!my.sprite.bigEnemyShip.visible) {
                let bigShip = my.sprite.bigEnemyShip;
                bigShip.gameReady = false;
                bigShip.setVisible(true);
                bigShip.setX(this.randomX());
                bigShip.setY(this.screenHeight-50);
                bigShip.health = 3;
                this.bigEnemyShipSpawned++;
                bigShip.path = this.enemyPathGenerator(bigShip.x,bigShip.y);
                bigShip.path.endX = bigShip.path.points[3].x
                bigShip.path.endY = bigShip.path.points[3].y
                bigShip.mode = "move";
                bigShip.dying = false;
                bigShip.noDuplicates = true;
                bigShip.countdown = Math.floor(Math.random() * 120);
            }
        }

        if (my.sprite.bigEnemyShip.visible){
            let bigEnemy = my.sprite.bigEnemyShip;
            bigEnemy.countdown--;
                if (bigEnemy.mode == "move"){
                    if (bigEnemy.countdown < 0) {
                        bigEnemy.gameReady = true;
                        this.runBigStartFollow(bigEnemy,bigEnemy.x,bigEnemy.y)
                        bigEnemy.mode = "moving";
                    }
                }
                else if (bigEnemy.mode == "moving"){
                    bigEnemy.gameReady = true;
                    if ((bigEnemy.x == bigEnemy.path.endX) && (bigEnemy.y == bigEnemy.path.endY)){
                        // enemy.stopFollow();
                        // enemy.setRotation(135);
                        // enemy.setX(enemy.path.endX);
                        // enemy.setY(enemy.path.endY);
                        //Cool we are at end location. Now shoot. 
                        bigEnemy.mode = "shoot";
                    }
                    if (scenevar.runCollisionCheck(bigEnemy,my.sprite.player)){
                        scenevar.currentHP -= 5;    //Subtract 5 HP.
                        bigEnemy.setVisible(false);
                        scenevar.updateHealth();
                    }
                }
                else if (bigEnemy.mode == "shoot"){
                    this.playerScore += 3;
                    this.updatePlayerScore();
                    for (let i = 0; i < 3; i++){
                    for (let cannon of my.sprite.enemyCannon) {
                        // If the cannon is invisible, it's available
                        if (!cannon.visible) {
                            //Set cannon X and Y and set Visible.
                            if (i == 0){
                            cannon.x = bigEnemy.x;
                            cannon.y = bigEnemy.y-40;
                            }
                            else if (i == 1){
                            cannon.x = bigEnemy.x+60;
                            cannon.y = bigEnemy.y-40;
                            }
                            else if (i == 2){
                            cannon.x = bigEnemy.x-60;
                            cannon.y = bigEnemy.y-40;
                            }
                            cannon.setVisible(true);
                            //Set mode back to move with a 3 second delay
                            bigEnemy.countdown = 180;
                            bigEnemy.mode = "move";
                            break;
                        }
                    }}
                }

                if (bigEnemy.health <= 0){
                    this.playerScore += 25;
                    this.updatePlayerScore();
                    bigEnemy.setVisible(false);
                }

                if (bigEnemy.y < -10){
                    this.playerScore += 25;
                    this.updatePlayerScore();
                    bigEnemy.setVisible(false);
                }
            }
        

            
        // Make all of the cannons move
        for (let cannon of my.sprite.cannon) {
            // if the cannon is visibile it's active, so move it
            if (cannon.visible || cannon.explosionSpeed > 0) {
                if (!cannon.hitEnemy){
                    cannon.y += this.ballSpeed; //Move Ball
                }
                if (my.sprite.bigEnemyShip.visible && !cannon.hitEnemy && my.sprite.bigEnemyShip.gameReady){
                    if (this.runCollisionCheck(cannon,my.sprite.bigEnemyShip)){
                        my.sprite.bigEnemyShip.health--;
                        cannon.hitEnemy = true;
                        scenevar.sound.play("hitSFX")
                        cannon.explosionSpeed = 1;
                    }
                }

                //Cycle Thru Enemies
                for (let visibleEnemies of my.sprite.enemyShips){
                    if (visibleEnemies.visible && visibleEnemies.gameReady){    //Only check if the enemy is visible.
                        if (this.runCollisionCheck(cannon,visibleEnemies)) {
                            cannon.hitEnemy = true;
                            scenevar.sound.play("hitSFX")
                            //Destroy Enemy
                            visibleEnemies.stopFollow();
                            visibleEnemies.setVisible(false);
                            this.playerScore += 10;
                            this.updatePlayerScore();
                            visibleEnemies.dying = true;
                            visibleEnemies.trans = 1;
                            visibleEnemies.deathShip.x = visibleEnemies.x;
                            visibleEnemies.deathShip.y = visibleEnemies.y;
                            visibleEnemies.deathShip.setRotation(visibleEnemies.rotation);
                            visibleEnemies.deathShip.setVisible(true);
                            visibleEnemies.deathShip.setAlpha(visibleEnemies.trans);
                            scenevar.enemyAlive--;
                            scenevar.updateEnemiesLeft();
                            visibleEnemies.path = scenevar.enemyDeathPath();
                            cannon.explosionSpeed = 1;
                            
                            }
                        }
                    else if (visibleEnemies.dying){
                        visibleEnemies.trans -= .05;
                        visibleEnemies.deathShip.setAlpha(visibleEnemies.trans);
                        if (visibleEnemies.trans <= 0){
                            visibleEnemies.noDuplicates = false;
                            visibleEnemies.dying = false;
                            visibleEnemies.deathShip.setVisible(false);
                        }


                    }
                }

                if (cannon.hitEnemy){
                    cannon.explosionSpeed -= .05;
                    //Create Explosion VFX
                    if (!cannon.explosion0.visible){
                        cannon.setVisible(false);
                        cannon.explosion0.setPosition(cannon.x,cannon.y);
                        cannon.explosion0.setVisible(true);
                    }
                    else if (cannon.explosion2.visible && cannon.explosionSpeed < .1){
                        cannon.explosion2.setVisible(false);
                        cannon.explosion1.setVisible(false);
                        cannon.explosion0.setVisible(false);
                        cannon.explosionSpeed = 0;
                        cannon.hitEnemy = false;
                    }
                    else if (cannon.explosion1.visible && cannon.explosionSpeed < .4){
                        cannon.explosion1.setVisible(false);
                        cannon.explosion2.setPosition(cannon.explosion1.x,cannon.explosion1.y);
                        cannon.explosion2.setVisible(true);
                    }
                    else if (cannon.explosion0.visible && cannon.explosionSpeed < .7){
                        cannon.explosion0.setVisible(false);
                        cannon.explosion1.setPosition(cannon.explosion0.x,cannon.explosion0.y);
                        cannon.explosion1.setVisible(true);
                    }

                }





                //Scale Manipulation
                if (cannon.y < 250){
                    cannon.theScale += .025
                    cannon.setScale(cannon.theScale)
                }
                //Make Smaller
                else {
                    cannon.theScale -= 0.01
                    cannon.setScale(cannon.theScale);
                }
            //sets cannonball invisible 
                if (cannon.y > 600) {
                    if (!cannon.hitEnemy && cannon.playAudio){
                        cannon.playAudio = false;
                        scenevar.sound.play("splashSFX")
                    }
                    cannon.setVisible(false);
            }
        }}
    
        
        // Make all of the enemy cannons move
        for (let cannon of my.sprite.enemyCannon) {
            // if the cannon is visibile it's active, so move it
            if (cannon.visible) {
                cannon.y -= this.ballSpeed;

                if (this.runCollisionCheck(cannon,my.sprite.player)){
                    scenevar.currentHP--;
                    scenevar.sound.play("hitSFX");
                    cannon.setVisible(false);
                    this.updateHealth();
                }


                // //Scale Manipulation - IMPLEMENT LATERRRR
                // if (cannon.y < 250){
                //     cannon.theScale += .025
                //     cannon.setScale(cannon.theScale)
                // }
                // //Make Smaller
                // else {
                //     cannon.theScale -= 0.01
                //     cannon.setScale(cannon.theScale);
                // }}
                //sets cannonball invisible 
                if (cannon.y < 50) {
                    cannon.setVisible(false);
                }
            }
        }

        if (this.enemySpawned == this.enemyCount){
            if (this.enemyAlive == 0 && my.sprite.bigEnemyShip.visible == false){
                //Will need to make a pause thing. Let player get upgrades as well.
                this.upgradeToggle = true;
                this.displayUpgradeText();
                this.hideEverything();

                //New Round Code
                this.enemySpawned = 0;  //Reset Counter
                this.enemyCount += 2;   //Increase enemies this round
                this.bigEnemyShipSpawned = 0;
                if (this.enemyVisibleCount < this.maxEnemyVisibleCount-1) {  //Caps at 10.
                    this.enemyVisibleCount++;    //Increase max enemies at once.
                }
                if (this.enemyVisibleCount > 4){
                    this.bigEnemyShipCount++;
                }
                this.updateEnemiesLeft();
            }
        }
    }

        if (this.upgradeToggle){

            //Full Heal
            if (this.key1.isDown){
                this.currentHP = 5;
                this.updateHealth();
                this.upgradeToggle = false;
                this.destroyUpgradeText();
            }  
            //Fire Rate Increase
            else if (this.key2.isDown){
                this.cannonCooldown -= 3;
                this.upgradeToggle = false;
                this.destroyUpgradeText();
            }
            else if (this.key3.isDown){
                this.playerSpeed += 2;
                this.upgradeToggle = false;
                this.destroyUpgradeText();
            }
        }


    
        }
}