
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function direction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if(dist > 0) return { x: dx / dist, y: dy / dist }; else return {x:0,y:0};
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function Rock(game) {
    this.player = 1;
    this.radius = 4;
    this.name = "Rock";
    this.color = "Gray";
    this.maxSpeed = 200;
    this.thrown = false;

    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };

};

Rock.prototype = new Entity();
Rock.prototype.constructor = Rock;

Rock.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Rock.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Rock.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Rock.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Rock.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Rock.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.thrown = false;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.thrown = false;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.thrown = false;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.thrown = false;
    }

    var chasing = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && ent.name === "Rock" && this.thrown && ent.thrown && this.collide(ent)) {
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
    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Rock.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};


function Zombie(game, clone) {
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 500;
    this.name = "Zombie";
    this.color = "Red";
    this.maxSpeed = minSpeed + (maxSpeed - minSpeed) * Math.random();

    if (!clone) {
        var randX = this.radius + Math.random() * (800 - this.radius * 2);
        var randY = this.radius + Math.random() * (800 - this.radius * 2);
        for (var i = 0; i < game.players.length; i++) {
            var player = game.players[i];
            if (player.collide({ x: randX, y: randY, radius: 40 })) {
                //console.log("Spawn Frag Averted");
                randX = this.radius + Math.random() * (800 - this.radius * 2);
                randY = this.radius + Math.random() * (800 - this.radius * 2);
                i = 0;
            }
        }
        Entity.call(this, game, randX, randY);
    } else {
        if (clone.x < 0) clone.x = this.radius;
        if (clone.y < 0) clone.y = this.radius;
        if (clone.x > 800) clone.x = 800 - this.radius;
        if (clone.y > 800) clone.y = 800 - this.radius;
        if (clone.x > 0 && clone.y > 0 && clone.x < 800 && clone.y < 800) {
            Entity.call(this, game, clone.x, clone.y);
        } else {
            Entity.call(this, game, 400, 400);
        }
    }
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Zombie.prototype = new Entity();
Zombie.prototype.constructor = Zombie;

Zombie.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Zombie.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Zombie.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Zombie.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Zombie.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Zombie.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

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

    var chasing = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name === "Zombie") {
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
            if (ent.name !== "Zombie" && ent.name !== "Rock" && !ent.removeFromWorld) {
                ent.removeFromWorld = true;
                //console.log(ent.name + " kills: " + ent.kills);
                var newZombie = new Zombie(this.game, ent);
                this.game.addEntity(newZombie);
            }
            if (ent.name === "Rock" && ent.thrown) {
                this.removeFromWorld = true;
                ent.thrown = false;
                ent.velocity.x = 0;
                ent.velocity.y = 0;
                ent.thrower.kills++;
            }
        }
        var acceleration = 1000000;

        if (ent.name !== "Zombie" && ent.name !== "Rock" && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius + 2) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist * dist);
                this.velocity.y += difY * acceleration / (dist * dist);
            }
            chasing = true;
        }


    }

    if (!chasing) {
        ent = this.game.zombies[randomInt(this.game.zombies.length)];
        var dist = distance(this, ent);
        if (dist > this.radius + ent.radius + 2) {
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            this.velocity.x += difX * acceleration / (dist * dist);
            this.velocity.y += difY * acceleration / (dist * dist);
        }

    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Zombie.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

function Player(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.visualRadius = 500;
    this.name = "Player 1";
    this.color = "White";
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

// the "main" code begins here
// globals
var friction = 1;
var maxSpeed = 100;
var minSpeed = 5;

var ASSET_MANAGER = new AssetManager();

// helper function
var updateStats;

function update() {
    updateStats();
};

var colors = ["lawngreen", "orchid", "turquoise", "gold", "skyblue", "white"];

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
	// console.log(direction({x:0, y:0}, {x:100, y:100}))
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var testAlone = false;
    var testTeams = true;
    var rumble = false;
    var rumbleonly = false;
    var royalRumble = 3;

    var numZombies = 1;
    var numPlayers = 6;
    var numRocks = 12;

    var games = 0;
    var runs = 6;

    var startTime = Date.now();

    var agent = 0;
    var agents = [];
    var agentClasses = [];

    var players = [];

    var teams;

    var timerDIV = document.getElementById("timer");
    var gamesDIV = document.getElementById("games");

    players.push(document.getElementById("playerOne"));
    players.push(document.getElementById("playerTwo"));
    players.push(document.getElementById("playerThree"));
    players.push(document.getElementById("playerFour"));
    players.push(document.getElementById("playerFive"));
    players.push(document.getElementById("playerSix"));
    players.push(document.getElementById("playerSeven"));
    players.push(document.getElementById("playerEight"));
    players.push(document.getElementById("playerNine"));
    players.push(document.getElementById("playerTen"));
    players.push(document.getElementById("playerEleven"));
    players.push(document.getElementById("playerTwelve"));
    players.push(document.getElementById("playerThirteen"));
    players.push(document.getElementById("playerFourteen"));
    players.push(document.getElementById("playerFifteen"));
    players.push(document.getElementById("playerSixteen"));
    players.push(document.getElementById("playerSeventeen"));
    players.push(document.getElementById("playerEighteen"));
    players.push(document.getElementById("playerNineteen"));
    players.push(document.getElementById("playerTwenty"));
    players.push(document.getElementById("playerTwentyOne"));
    players.push(document.getElementById("playerTwentyTwo"));

    function testAgent() {
        console.log("Agent: " + agent + " Run: " + (6 - runs + 1));
        if (agent < agents.length && runs-- > 0) {
            gameEngine.reset();

            circle = agents[agent];
            circle.removeFromWorld = false;
            circle.games++;
            var gap = 200;
            circle.x = 400 - gap / 2 + randomInt(gap);
            circle.y = 400 - gap / 2 + randomInt(gap);
            players[agent].className = "p" + 1;
            circle.color = colors[0];
            gameEngine.addEntity(circle);

            for (var i = 0; i < numZombies; i++) {
                circle = new Zombie(gameEngine);
                gameEngine.addEntity(circle);
            }

            for (var i = 0; i < numRocks; i++) {
                circle = new Rock(gameEngine);
                gameEngine.addEntity(circle);
            }
        } else if (runs <= 0) {
            runs = 6;
            agent++;
            testAgent();
        }
    }

    function testAgentTeam() {
        if (agent < agents.length && runs-- > 0) {
            gameEngine.reset();

            players[agent].className = "p" + 1;

            for (var i = 0; i < numPlayers; i++) {
                circle = new agentClasses[agent](gameEngine);
                circle.removeFromWorld = false;
                circle.games = 6 - runs;
                circle.time = 0;
                var gap = 200;
                circle.x = 400 - gap / 2 + randomInt(gap);
                circle.y = 400 - gap / 2 + randomInt(gap);
                circle.color = colors[0];
                gameEngine.addEntity(circle);
            }

            for (var i = 0; i < numZombies; i++) {
                circle = new Zombie(gameEngine);
                gameEngine.addEntity(circle);
            }

            for (var i = 0; i < numRocks; i++) {
                circle = new Rock(gameEngine);
                gameEngine.addEntity(circle);
            }
        } else if (runs <= 0) {
            runs = 6;
            agent++;
            testAgentTeam();
        }

    }

    function generateTeams() {
        var list = [];
        var perm = [];

        for (var j = 0; j < 6; j++) {
            for (var i = 0; i < agents.length; i++) {
                list.push(i);
            }
            var remainder = perm.length % 6;
            var numChecks = 6 - remainder;
            var temp = [];

            for (var i = 0; i < remainder; i++) {
                temp.push(perm[perm.length - 1 - i]);
            }
            //console.log(temp + " " + remainder);
            if (numChecks < 6) {
                for (var i = 0; i < numChecks; i++) {
                    var item = list.splice(randomInt(list.lenghth), 1)[0];
                    if (temp.indexOf(item) != -1) {
                        list.push(item);
                        i--;
                        //console.log("append");
                    } else {
                        perm.push(item);
                    }
                }
            }

            while (list.length > 0) {
                perm.push(list.splice(randomInt(list.length), 1)[0]);
            }
        }

        for (var j = 0; j < perm.length; j += 6) {
            var temp = [];
            for (var i = 0; i < 6; i++) {
                var index = j + i;
                if (temp.indexOf(perm[index]) > -1)  console.log(perm[index] + " " + i + " " + index + " " + perm.length);
                else temp.push(perm[index]);
            }
        }
        return perm;
    };


    function loadSimulation() {
        //console.log("loading sim");
		// console.log(direction({x:0, y:0}, {x:10, y:10}))

        games++;
        gamesDIV.innerHTML = "Games: " + games;

        gameEngine.zombieCooldownMax = 1;
        var circle;

        if (!teams) teams = generateTeams();

        if (rumbleonly) teams = [];
        //console.log(teams);

        if (teams.length > 0) {

            gameEngine.reset();

            for (var i = 0; i < numPlayers; i++) {
                circle = agents[teams[0]];
                circle.removeFromWorld = false;
                circle.games++;
                var gap = 200;
                circle.x = 400 - gap / 2 + randomInt(gap);
                circle.y = 400 - gap / 2 + randomInt(gap);
                players[teams[0]].className = "p" + (i + 1);
                circle.color = colors[i];
                gameEngine.addEntity(circle);
                teams.splice(0, 1);
            }

            for (var i = 0; i < numZombies; i++) {
                circle = new Zombie(gameEngine);
                gameEngine.addEntity(circle);
            }

            for (var i = 0; i < numRocks; i++) {
                circle = new Rock(gameEngine);
                gameEngine.addEntity(circle);
            }
        }
        else if(royalRumble-- > 0) {

            gameEngine.reset();

            for (var i = 0; i < agents.length; i++) {
                circle = agents[i];
                players[i].className = "p" + (i %6 + 1);
                circle.removeFromWorld = false;
                circle.games++;
                var gap = 400;
                circle.x = 400 - gap / 2 + randomInt(gap);
                circle.y = 400 - gap / 2 + randomInt(gap);
                circle.color = colors[i % 6];
                gameEngine.addEntity(circle);
                teams.splice(0, 1);
            }

            for (var i = 0; i < numZombies; i++) {
                circle = new Zombie(gameEngine);
                gameEngine.addEntity(circle);
            }

            for (var i = 0; i < numRocks; i++) {
                circle = new Rock(gameEngine);
                gameEngine.addEntity(circle);
            }
        }
    };

    updateStats = function () {
        var scale = 10;

        timerDIV.innerHTML = "Timer: " + Math.floor((gameEngine.elapsedTime * 10)) / 10;

        if (!testAlone && testTeams) {
            for (var i = 0; i < gameEngine.players.length; i++) {
                agents[agent].kills += gameEngine.players[i].kills;
                gameEngine.players[i].kills = 0;
                agents[agent].time += gameEngine.players[i].time;
                gameEngine.players[i].time = 0;
                agents[agent].games = gameEngine.players[i].games;
            }
        }

        for (var i = 0; i < agents.length; i++) {
            players[i].children[1].innerHTML = "Games: " + agents[i].games;
            players[i].children[2].innerHTML = "Kills: " + agents[i].kills;
            players[i].children[3].innerHTML = "Time: " + Math.floor(agents[i].time * scale) / scale;
            if (!agents[i].x || !agents[i].y) {
                //console.log("spawn fail ");
                console.log(agents[i].x + " " + agents[i].y);
                agents[i].x = 400;
                agents[i].y = 400;
                agents[i].removeFromWorld = true;
            }
            if (agents[i].removeFromWorld) players[i].className = "";
        }

        if (gameEngine.players.length === 0) {
            if (testAlone) {
                if(agent < agents.length) {
                    testAgent();
                } else {
                    testAlone = false;
                    agent = 0;
                    if(testTeams) testAgentTeam();
                    else if (rumble) loadSimulation();
                }
            } else if (testTeams) {
                if (agent < agents.length) {
                    testAgentTeam();
                } else {
                    testTeams = false;
                    agent = 0;
                    if (rumble) loadSimulation();
                }
            } else if (rumble && royalRumble > 0) {
                loadSimulation();
            }
        }
    };

    function clearPlayerClasses() {
        for (var i = 0; i < players.length; i++) {
            players[i].className = "";
        }
    };

    var gameEngine = new GameEngine();

    agents.push(new KGMR(gameEngine));
    agentClasses.push(KGMR);

    for (var i = 0; i < agents.length; i++) {
        circle = agents[i];
        players[i].children[0].innerHTML = circle.name;
    }

    for (var i = 0; i < agents.length; i++) {
        agents[i].games = 0;
        agents[i].kills = 0;
        agents[i].time = 0;
    }

    //loadSimulation();

    console.log("Test Alone " + testAlone + " Test Teams " + testTeams + " Rumble " + rumble);
    if (testAlone) testAgent();
    else if (testTeams) testAgentTeam();
    else loadSimulation();

    gameEngine.init(ctx);
    gameEngine.start();

    window.setInterval(update, 100);
});
