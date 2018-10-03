// OUTLAST VERSION 2

// socket.on("mouse", countVotes);
//socket.broadcast.emit("mouse", data);
//io.sockets.emit("mouse", data); - ALL

console.log("server is starting! :)");
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static("website"));

var grid = new Grid();

var cost = 10;
var reward = 50;
var disutility = 30;

var players = 0; // total number of clients
var check = 0; // number of people input their strategies
var check1 = 0; // number of people vetoed
var check2 = 0; // number of people logged in

var count = 0; // number of vetos
var invalid = false;
var strikes = 0; // number of invalid games

function Grid() {
  this.games = 0;
  this.players = [];
  this.hashtable = {};
  this.hashtable2 = {};
  this.id = [];
  this.candidates = [];
  this.noncandidates = [];
  this.winners = [];
  this.losers = [];
  this.eliminated = [];
  this.noneliminated = [];
  this.voteposition = [];
  this.end = false;
}

var socket = require("socket.io");
var io = socket(server);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  console.log(socket.id);
  console.log("new connection!!!");
  players++;
  grid.id.push(socket.id);
  socket.on("newPlayer", function(data) {
    if (players < 5) {
      io.sockets.emit("lessPlayers", grid, players);
    }
    else if (grid.games > 0) {
      players--;
      io.to(socket.id).emit("ongoingGame", grid);
    }
    else {
      if (grid.players.length == 0) {
        if (data.name == "") {
          io.to(socket.id).emit("changeName", data)
        }
        else {
          check2++;
          grid.players.push(data);
          grid.noneliminated.push(data);
          io.to(socket.id).emit("startGame", grid);
          var name = data.name;
          grid.hashtable[name] = data;
          grid.hashtable[name].id = socket.id;
        }
      }
      else {
        for (var i = 0; i < grid.players.length; i++) {
          var string1 = grid.players[i].name.trim();
          string1 = string1.toUpperCase();
          var string2 = data.name.trim();
          string2 = string2.toUpperCase();
          if (string1 == string2 || data.name == "") {
            console.log("same name error");
            io.to(socket.id).emit("changeName", data);
            break;
          }
          if (i == grid.players.length -1 && string1 != string2) {
            check2++;
            grid.players.push(data);
            grid.noneliminated.push(data);
            var name = data.name;
            grid.hashtable[name] = data;
            grid.hashtable[name].id = socket.id;
            io.to(socket.id).emit("startGame", grid);
            if (check2 == players) {
              for (var i = 0; i < players; i++) {
                grid.voteposition[i] = [];
              }
              for (var i = 0; i < players; i++) {
                grid.voteposition[players-1].push(grid.players[i]);
              }
              io.sockets.emit("initialPosition", grid);
            }
            break;
          }
        }
      }
    }
  });
  socket.on("initialPosition", initialPosition);
  socket.on("inputStrategies", inputStrategies);
  socket.on("countVeto", countVeto);
  socket.on('disconnect', function () {
    players--;
    for (var i = 0; i < grid.players.length; i++) {
      if (grid.players[i].id == socket.id) {
        grid.players.splice(i, 1);
      }
    }
    if (players == 1) {
      console.log("game ended bc only 1 person remaining");
      gameEnd("Only 1 person remaining. Game End.");
    }
    console.log("players = " + players)
    if (players == 0)
      restart();
  });
}

function restart() {
  grid.games = 0;
  grid.id = [];
  grid.players = [];
  grid.hashtable = {};
  grid.hashtable2 = {};
  grid.eliminated = [];
  grid.noneliminated = [];
  grid.end = false;

  cost = 10;
  reward = 50;
  disutility = 30;

  players = 0;
  check = 0;
  check1 = 0;
  check2 = 0;

  count = 0;
  invalid = false;
}

function initialPosition(data) {
  grid.hashtable[data.name].row = data.row;
  grid.hashtable[data.name].col = data.col;
}

function inputStrategies(data) {
  grid.hashtable[data.name].strategy = data.strategy;
  check++;
  if (check == players) {
    //io.sockets.emit("inputVeto", grid);
    countVotes();
  }
}

function countVeto(data) {
  invalid = false;
  grid.hashtable[data.name].veto = data.veto;
  grid.hashtable[data.name].vetocount = data.vetocount;
  check1++;
  if (check1 == players) {
    for (var i = 0; i < players; i++) {
      if (data.veto == true)
        count++;
    }
    if (count >= (players / 2)) {
      invalid = true;
    }
    countVotes();
  }
}

function countVotes() {
  grid.games++;
  check = 0;
  check1 = 0;
  count = 0;
  grid.reset();
  grid.sort();
  if (invalid == false) {
    var candidates = grid.candidates;
    var noncandidates = grid.noncandidates;
    if (candidates.length > 0 && noncandidates.length > 0) {
      strikes = 0;
      for (var i = 0; i < grid.noncandidates.length; i++) {
        var lowest = players * 2;
        for (var j = 0; j < grid.candidates.length; j++) {
          var diffR = Math.abs(grid.noncandidates[i].row - grid.candidates[j].row);
          var diffC = Math.abs(grid.noncandidates[i].col - grid.candidates[j].col);
          var diff = diffR + diffC;
          if (diff < lowest) {
            lowest = diff;
          }
        }
        for (var j = 0; j < grid.candidates.length; j++) {
          var diffR = Math.abs(grid.noncandidates[i].row - grid.candidates[j].row);
          var diffC = Math.abs(grid.noncandidates[i].col - grid.candidates[j].col);
          var diff = diffR + diffC;
          if (diff == lowest) {
            grid.candidates[j].voters.push(grid.noncandidates[i]);
            grid.candidates[j].votes++;
          }
        }
      }
      var highest = 0;
      for (var i = 0; i < grid.candidates.length; i++) {
        if (grid.candidates[i].votes > highest)
          highest = grid.candidates[i].votes;
      }
      for (var i = 0; i < grid.candidates.length; i++) {
        if (grid.candidates[i].votes == highest)
          grid.winners.push(grid.candidates[i]);
        else
          grid.losers.push(grid.candidates[i]);
      }
    }
    else if (candidates.length == 0) {
      strikes++;
      if (strikes == 3) {
        console.log("game ended bc invalid 3 times");
        gameEnd("3 continuous rounds rendered invalid. Game End.");
      }
    }
  }
  else {
    strikes++;
    if (strikes == 3) {
      console.log("game ended bc invalid 3 times");
      gameEnd("3 continuous rounds rendered invalid. Game End.");
    }
  }
  if (grid.end == false) {
    grid.payoffs();
    grid.rearrange();
    grid.elimination();
    io.sockets.emit("displayStats", grid);
  }
}

Grid.prototype.reset = function() {
  grid.candidates = [];
  grid.noncandidates = [];
  grid.winners = [];
  grid.losers = [];
}

Grid.prototype.sort = function() {
  var candidates = grid.candidates;
  var noncandidates = grid.noncandidates;
  for (var i = 0; i < players; i++) {
    grid.players[i].voters = [];
    if (grid.players[i].strategy == "run")
      candidates.push(grid.players[i]);
    else
      noncandidates.push(grid.players[i]);
  }
}

Grid.prototype.payoffs = function() {
  var candidates = grid.candidates;
  var noncandidates = grid.noncandidates;
  var winners = grid.winners;
  var losers = grid.losers;
  for (var i = 0; i < candidates.length; i++) {
    candidates[i].money -= cost;
  }
  if (invalid == false) {
    if (candidates.length == 1) {
      for (var i = 0; i < noncandidates.length; i++) {
        noncandidates[i].money -= disutility;
      }
      candidates[0].money += reward;
    }
    else {
      for (var i = 0; i < winners.length; i++) {
        winners[i].money += reward / winners.length;
        for (var j = 0; j < winners[i].voters.length; j++) {
          // temporarily adding some arbritrary values
          var voter = winners[i].voters[j];
          voter.money += reward / (winners.length * 2);
        }
      }
      for (var i = 0; i < losers.length; i++) {
        losers[i].money -= disutility;
        for (var j = 0; j < losers[i].voters.length; j++) {
          // temporarily adding some arbritrary values
          var voter = losers[i].voters[j];
          voter.money -= disutility / (losers.length * 2);
        }
      }
    }
  }
}

Grid.prototype.rearrange = function() {
  // arranging on the basis of money
  for (var i = players-1; i > 0; i--) {
    var highest = i;
    for (var j = 0; j <= i; j++) {
      if (grid.players[j].money > grid.players[highest].money)
        highest = j;
    }
    var temp = grid.players[highest];
    grid.players[highest] = grid.players[i];
    grid.players[i] = temp;
  }
  for (var i = 0; i < players; i++) {
    grid.players[i].col = i;
  }
  // arranging on the basis of votes
  for (var i = grid.voteposition.length-1; i >= 0; i--) {
    if (grid.voteposition[i].length > 1) {
      var index = grid.voteposition[i][0].votes;
      for (var j = 0; j < grid.voteposition[i].length; j++) {
        if (grid.voteposition[i][j].votes < index)
          index = grid.voteposition[i][j].votes;
      }
      for (var k = 0; k < grid.voteposition[i].length; k++) {
        if (grid.voteposition[i][k].votes > index) {
          var ele = grid.voteposition[i][k];
          grid.voteposition[i-1].push(ele);
          grid.voteposition[i].splice(k, 1);
          k--;
        }
      }
    }
  }
  for (var i = grid.voteposition.length-1; i >= 0; i--) {
    if (grid.voteposition[i].length > 0) {
      for (var j = 0; j < grid.voteposition[i].length; j++) {
        grid.players[grid.voteposition[i][j].col].row = i;
      }
    }
  }
}

Grid.prototype.elimination = function() {
  var lowestvotes = 0;
  var lowestmoney = 0;
  var noneliminated = grid.noneliminated;
  var multiple = false;
  for (var i = 0; i < noneliminated.length; i++) {
    if (noneliminated[i].votes < noneliminated[lowestvotes].votes)
      lowestvotes = i;
    if (noneliminated[i].money < noneliminated[lowestmoney].money)
      lowestmoney = i;
  }
  for (var i = 0; i < noneliminated.length; i++) {
    if (i != lowestvotes && noneliminated[i].votes == noneliminated[lowestvotes].votes)
      multiple = true;
    if (i != lowestmoney && noneliminated[i].money == noneliminated[lowestmoney].money)
      multiple = true;
  }
  if (lowestvotes == lowestmoney && multiple == false) {
    io.to(noneliminated[lowestvotes].id).emit("eliminatedPlayer", grid);
    noneliminated[lowestvotes].eliminated = true;
    grid.eliminated.push(noneliminated.splice(lowestvotes, 1));
  }
  if (noneliminated.length == 1 && grid.end == false) {
    console.log("game ended bc only 1 person standing");
    gameEnd("Only 1 person remaining. Game End.");
  }
}

function gameEnd(message) {
  grid.end = true;
  io.sockets.emit("endGame", grid, message);
}
