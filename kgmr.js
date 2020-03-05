
// find and replace KGMR with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function KGMR(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Krome";
    this.color = "White";
    this.cooldown = 0;
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
};

KGMR.prototype = new Entity();
KGMR.prototype.constructor = KGMR;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players

KGMR.prototype.selectAction = function () {

    var action = { direction: { x: this.direction.x, y: this.direction.y }, throwRock: false, target: null };
    var closestZ = 1000;
	var closestR = 1000;
	var closestP = 1000;
    var zombie = null;
	var rock = null;
	var noRockPlayer = null;
	// var player = null;
	// var zombieDistLim = 200;

    for (var i = 0; i < this.game.zombies.length; i++) {
        var ent = this.game.zombies[i];
        var dist = distance(ent, this);
        if (dist < closestZ) {
            closestZ = dist;
            zombie = ent;
        }
    }

	for (var i = 0; i < this.game.rocks.length; i++) {
		var ent = this.game.rocks[i];
		var dist = distance(ent, this);
		if (dist < closestR) {
			closestR = dist;
			rock = ent;
		}
	}

	var players = [];
	for (var i = 0; i < this.game.players.length; i++) {
		var ent = this.game.players[i];
		if (ent != this) {
            var dist = distance(ent, this);
            var tempPlayer = {player:ent, dist:dist, x:ent.x, y:ent.y, totalDist: 0};
            for (var j = 0; j < this.game.zombies.length; j++) {
                var entZ = this.game.zombies[j];
                var distZ = distance(entZ, ent);
                tempPlayer.totalDist += distZ;
            }            
            players.push(tempPlayer);
			if (dist < closestP) {
				closestP = dist;
				player = ent;
			}
		}
	}

	players.sort((a, b) => (a.dist > b.dist) ? 1 : -1);

	for (var i = 0; i < players.length; i++) {
		if (players[i].player.rocks == 0) {
			noRockPlayer = players[i]
			break;
		}
	}

	//TODO
	//upgrade evasion mechanism like its at wall, where should it move
	//it tends to just be stuck there waiting for its doom
	//&& adjust some numbers for optimality
	//&& folow the leader mentality to collide speed bost
    // make player with rock = 0 or 1(maybe) to follow rock = 1 or rock = 2
    
    var leaderBoolean = false;
    var leader = this;
    for (var i = 0; i < this.game.players.length; i++) {
		var ent = this.game.players[i];
        leaderBoolean = leaderBoolean || ent.isLeader;
        if(ent.isLeader) {
            leader = ent;
        }
    }

    if(!leaderBoolean) {
        this.isLeader = true;
    } 



    var tempDir;
    
    if (!this.isLeader && distance(this, leader) < 20) {
        tempDir = leader.selectAction().direction;
    } else if (this.rocks == 2 && zombie && this.cooldown == 0 && closestZ > 20) {
		tempDir = direction(zombie, this);
	} else if ((closestR < closestZ || closestZ > 200) && rock && this.rocks < 2) {
		tempDir = direction(rock, this);
	} else  if (zombie) {
		// tempDir = direction(this, zombie);
        //TODO evasion upgrade
        tempDir = {x:0, y:0};
        for (var j = 0; j < this.game.zombies.length; j++) {
            var entZ = this.game.zombies[j];
            var distZ = distance(entZ, this);
            var zDir = direction(this, zombie);
            tempDir.x += zDir.x / distZ;
            tempDir.y += zDir.y / distZ;
        }   
	} else {
        tempDir = direction(leader, this);
    }
	tempDir.x += tempDir.x * 10000;
	tempDir.y += tempDir.y * 10000;
	// tempDir.x -= this.velocity.x;
	// tempDir.y -= this.velocity.y;
	action.direction = tempDir;

	if (closestZ < 140) {
		action.throwRock = true;
    	action.target = zombie;
 	}
	else if (this.rocks == 2 && noRockPlayer) {
		action.throwRock = true;
		action.target = noRockPlayer;
    }
    else if (this.rocks == 2 && players.length > 0) {
        players.sort((a, b) => (a.totalDist > b.totalDist) ? 1 : -1);
        if (players[0].totalDist / this.game.zombies.length < 100) {
            // console.log(players)
            // action.throwRock = true;
            // action.target = players[0];
        }
    }

	// action.direction = direction(this, zombie);
	// if (this.x < 100) {
	// 	act
	// }
	// if (this.x > 700) {
	//
	// }
	// if (this.y < 100) {
	//
	// }
	// if (this.y > 700) {
	//
	// }

    return action;
};

// do not change code beyond this point

KGMR.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

KGMR.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

KGMR.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

KGMR.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

KGMR.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

KGMR.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    //if (this.cooldown > 0) console.log(this.action);
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }


    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);
		// console.log(dir)
        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

KGMR.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};
