/*************************************************************************
## Pig Slayer - a very simple ScriptCraft mini-game

### How to Play

At the in-game prompt type '/js pigslayer(n)' to start playing. n is the
number of pigs needed to kill to win the round.

Kill pigs to score points.

The first player to reach n pigs killed wins the round and the game starts
over.

Your score is displayed in a side-bar along the right edge of of the screen.

### Disclaimer and bugs

This is my very first experiment with ScriptCraft and Javascript. I assume
that the code looks ugly and disorganised in the eyes of 'real' programmer.

I created this game in order to learn.

The game needs to be started before players join, otherwise they will have to
re-join the server.

### Installation

This game is a ScriptCraft mod/plugin. You will need to have a Minecraft
server that runs the ScriptCraft mod.

More info here:
https://github.com/walterhiggins/ScriptCraft/blob/master/docs/YoungPersonsGuideToProgrammingMinecraft.md

Or, better yet, buy the book here:
http://www.amazon.co.uk/Beginners-Writing-Minecraft-Plugins-JavaScript/

Feel free to reach out on Twitter:
https://twitter.com/ChristianRiis

***/

var scoreboard = require('minigames/scoreboard');
var items = require('items');
var sounds = require('sounds');
var utils = require('utils');
var scores = {};
var global_killsToEndGame;

// start the game by typing '/js pigslayer(10)' at the Minecraft prompt
exports.pigslayer = start;

function start( killsToEndGame ) {
  if (typeof killsToEndGame == 'undefined') {
    console.log('No killsToEndGame defined, setting to 10 kills');
    killsToEndGame = 10;
  }
  global_killsToEndGame = killsToEndGame;
  console.log('Setting up scoreboard. Pigs to kill: ' + global_killsToEndGame);

  server.executeVanillaCommand(server, 'scoreboard objectives remove ThePigBoard');
  scoreboard.create('ThePigBoard', 'Pigs killed');
  server.executeVanillaCommand(server, 'scoreboard objectives setdisplay belowname ThePigBoard');

  console.log('Clearing previous scores ...');
  scores = {};
  var players = utils.players();
  for (var i = 0;i < players.length; i++) {
    server.executeVanillaCommand(server, 'scoreboard players set ' + players[i].name  + ' ThePigBoard ' + 0);
    scores[players[i].name] = 0;
  }
}

function playerJoins( event ) {
  var playerName = event.player.name
  scoreboard.removeTeam(playerName);
  console.log(playerName + ' joined Pig Slayer ...');
  scores[playerName] = 0;
  scoreboard.addTeam(playerName, playerName);
  scoreboard.addPlayerToTeam('ThePigBoard', playerName, playerName);
  server.executeVanillaCommand(server, 'scoreboard players set ' + playerName + ' ThePigBoard ' + 0);
  echo(event.player, 'You need to kill some innocent pigs ...');
  echo(event.player, 'First player to reach ' + global_killsToEndGame + ' wins the round!');
  //scoreboard.updateScore('ThePigBoard', playerName, 1); // this function does not work in scoreboard.js
}
events.playerJoin( playerJoins );

function somethingKilled( event) {
  var killerName = 'A killer clown'; // need to handle 'undefined'. Bats are killed all the time ..!
  killedEntity = event.entity.entityType;
  killer = event.damageSource.damageDealer;

  if (killer != null) {
    killerName = killer.name;
  }
  console.log(killerName + ' killed a ' + killedEntity);

    if (killedEntity.toString() == 'PIG' ) {
      scores[killerName] += 1;
      console.log(killerName + ' has now killed ' + scores[killerName] + ' pigs ...');
      server.executeVanillaCommand(server, 'scoreboard players add ' + killerName + ' ThePigBoard ' + 1);
      if (scores[killerName] == global_killsToEndGame) {
        console.log(killerName + ' won this round!');
        resetGame(killerName)
      }
    }
}
events.entityDeath( somethingKilled );

function resetGame( winner ) {
  var players = utils.players();
  console.log('Reseting game ...');
  for (var i = 0;i < players.length; i++) {
    sounds.portalTravel(players[i].location);
    if (players[i].name == winner) {
        echo(players[i], 'Congratulations, you won this round!')
    }
    else {
        echo(players[i], 'You lost this round!')
    }
  }
  start(global_killsToEndGame); // re-starting the game
}
