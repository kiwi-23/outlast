console.log("server is starting! :)");
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static("website"));

var spectrum = new Spectrum();

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

function Spectrum() {
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
  this.end = false;
}

var socket = require("socket.io");
var io = socket(server);

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  console.log(socket.id);
  console.log("new connection!!!");
  players++;
  spectrum.id.push(socket.id);
  socket.on("newPlayer", function(data) {
    if (players < 5) {
      io.sockets.emit("lessPlayers", spectrum, players);
    }
    else if (spectrum.games > 0) {
      players--;
      io.to(socket.id).emit("ongoingGame", spectrum);
    }
    else {
      if (spectrum.players.length == 0) {
        if (data.name == "") {
          io.to(socket.id).emit("changeName", data)
        }
        else {
          check2++;
          spectrum.players.push(data);
          spectrum.noneliminated.push(data);
          io.to(socket.id).emit("startGame", spectrum);
          var name = data.name;
          spectrum.hashtable[name] = data;
          spectrum.hashtable[name].id = socket.id;
        }
      }
      else {
        for (var i = 0; i < spectrum.players.length; i++) {
          var string1 = spectrum.players[i].name.trim();
          string1 = string1.toUpperCase();
          var string2 = data.name.trim();
          string2 = string2.toUpperCase();
          if (string1 == string2 || data.name == "") {
            console.log("same name error");
            io.to(socket.id).emit("changeName", data);
            break;
          }
          if (i == spectrum.players.length -1 && string1 != string2) {
            check2++;
            spectrum.players.push(data);
            spectrum.noneliminated.push(data);
            var name = data.name;
            spectrum.hashtable[name] = data;
            spectrum.hashtable[name].id = socket.id;
            io.to(socket.id).emit("startGame", spectrum);
            if (check2 == players) {
              io.sockets.emit("initialPosition", spectrum);
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
    for (var i = 0; i < spectrum.players.length; i++) {
      if (spectrum.players[i].id == socket.id) {
        spectrum.players.splice(i, 1);
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
  spectrum.games = 0;
  spectrum.id = [];
  spectrum.players = [];
  spectrum.hashtable = {};
  spectrum.hashtable2 = {};
  spectrum.eliminated = [];
  spectrum.noneliminated = [];
  spectrum.end = false;

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
  spectrum.hashtable[data.name].position = data.position;
}

function inputStrategies(data) {
  spectrum.hashtable[data.name].strategy = data.strategy;
  check++;
  if (check == players) {
    //io.sockets.emit("inputVeto", spectrum);
    countVotes();
  }
}

function countVeto(data) {
  invalid = false;
  spectrum.hashtable[data.name].veto = data.veto;
  spectrum.hashtable[data.name].vetocount = data.vetocount;
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
  spectrum.games++;
  check = 0;
  check1 = 0;
  count = 0;
  spectrum.reset();
  spectrum.sort();
  if (invalid == false) {
    var candidates = spectrum.candidates;
    var noncandidates = spectrum.noncandidates;
    if (candidates.length > 0 && noncandidates.length > 0) {
      strikes = 0;
      for (var i = 0; i < noncandidates.length; i++) {
        var lowest = players + 1;
        for (var j = 0; j < candidates.length; j++) {
          var diff = Math.abs(candidates[j].position - noncandidates[i].position);
          if (diff < lowest)
            lowest = diff;
        }
        for (var j = 0; j < candidates.length; j++) {
          var diff = Math.abs(candidates[j].position - noncandidates[i].position);
          if (diff == lowest) {
            candidates[j].voters.push(noncandidates[i]);
            candidates[j].votes++;
          }
        }
      }
      var highest = 0;
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].voters.length > highest)
          highest = candidates[i].voters.length;
      }
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].voters.length == highest)
          spectrum.winners.push(candidates[i]);
        else
          spectrum.losers.push(candidates[i]);
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
  if (spectrum.end == false) {
    spectrum.payoffs();
    spectrum.rearrange();
    spectrum.elimination();
    io.sockets.emit("displayStats", spectrum);
  }
}

Spectrum.prototype.reset = function() {
  spectrum.candidates = [];
  spectrum.noncandidates = [];
  spectrum.winners = [];
  spectrum.losers = [];
}

Spectrum.prototype.sort = function() {
  var candidates = spectrum.candidates;
  var noncandidates = spectrum.noncandidates;
  for (var i = 0; i < players; i++) {
    spectrum.players[i].voters = [];
    if (spectrum.players[i].strategy == "run")
      candidates.push(spectrum.players[i]);
    else
      noncandidates.push(spectrum.players[i]);
  }
}

Spectrum.prototype.payoffs = function() {
  var candidates = spectrum.candidates;
  var noncandidates = spectrum.noncandidates;
  var winners = spectrum.winners;
  var losers = spectrum.losers;
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

Spectrum.prototype.rearrange = function() {
  for (var i = players-1; i > 0; i--) {
    var highest = i;
    for (var j = 0; j <= i; j++) {
      if (spectrum.players[j].money > spectrum.players[highest].money)
        highest = j;
    }
    var temp = spectrum.players[highest];
    spectrum.players[highest] = spectrum.players[i];
    spectrum.players[i] = temp;
  }
  for (var i = 0; i < players; i++) {
    spectrum.players[i].position = i+1;
  }
}

Spectrum.prototype.elimination = function() {
  var lowestvotes = 0;
  var lowestmoney = 0;
  var noneliminated = spectrum.noneliminated;
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
    io.to(noneliminated[lowestvotes].id).emit("eliminatedPlayer", spectrum);
    noneliminated[lowestvotes].eliminated = true;
    spectrum.eliminated.push(noneliminated.splice(lowestvotes, 1));
  }
  if (noneliminated.length == 1 && spectrum.end == false) {
    console.log("game ended bc only 1 person standing");
    gameEnd("Only 1 person remaining. Game End.");
  }
}

function gameEnd(message) {
  spectrum.end = true;
  io.sockets.emit("endGame", spectrum, message);
}
