var spectrum;
var game = 0;
var players = 7;
var cost = 10;
var reward = 50;
var disutility = 30;
var dropdown = [players];
var input_name = [players];
var button;
var timer = 60;

function setup() {
  spectrum = new Spectrum();
  for (var i = 0; i < players; i++) {
    input_name[i] = createInput();
    input_name[i].parent("names-div");
    input_name[i].style("width", "10%");
  }
  for (var i = 0; i < players; i++) {
    var player = new Player(i+1);
    spectrum.addPlayer(player);
    dropdown[i] = createSelect();
    dropdown[i].parent("strategies-div");
    dropdown[i].option("not run");
    dropdown[i].option("run");
  }
  button = createButton("done!");
  button.parent("strategies-div");
  button.mousePressed(countVotes);
}

function Spectrum() {
  this.players = [];
  this.hashtable = {};
  this.candidates = [];
  this.noncandidates = [];
  this.winners = [];
  this.losers = [];
}

function Player(index) {
  this.name = "";
  this.position = index;
  this.money = 100;
  this.votes = 0;
  this.voters = [];
  this.strategy = "not run";
}

Spectrum.prototype.addPlayer = function(p) {
  this.players.push(p);
  var title = p.name;
  this.hashtable[title] = p;
}

function countVotes() {
  game++;
  spectrum.reset();
  spectrum.sort();
  var candidates = spectrum.candidates;
  var noncandidates = spectrum.noncandidates;
  if (candidates.length > 0 && noncandidates.length > 0) {
    for (var i = 0; i < noncandidates.length; i++) {
      var lowest = players + 1;
      var index;
      for (var j = 0; j < candidates.length; j++) {
        var diff = Math.abs(candidates[j].position - noncandidates[i].position);
        if (diff < lowest) {
          index = j;
          lowest = diff;
        }
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
    var winner;
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].voters.length > highest) {
        highest = candidates[i].voters.length;
        winner = i;
      }
    }
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].voters.length == highest)
        spectrum.winners.push(candidates[i]);
      else
        spectrum.losers.push(candidates[i]);
    }
  }
  spectrum.payoffs();
  spectrum.rearrange();
  console.log(spectrum);
}

Spectrum.prototype.reset = function() {
  for (var i = 0; i < players; i++) {
    spectrum.players[i].name = input_name[i].value();
  }
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
    spectrum.players[i].strategy = dropdown[i].value();
    if (spectrum.players[i].strategy == "run")
      candidates.push(spectrum.players[i]);
    else
      noncandidates.push(spectrum.players[i]);
  }
}

Spectrum.prototype.payoffs = function() {
  var candidates = spectrum.candidates;
  var noncandidates = spectrum.noncandidates;
  for (var i = 0; i < candidates.length; i++) {
    candidates[i].money -= cost;
  }
  if (candidates.length == 1) {
    for (var i = 0; i < noncandidates.length; i++) {
      noncandidates[i].money -= disutility;
    }
  }
  for (var i = 0; i < spectrum.winners.length; i++) {
    spectrum.winners[i].money += (reward / spectrum.winners.length);
  }
  for (var i = 0; i < this.losers.length; i++) {
    spectrum.losers[i].money -= disutility;
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

function draw() {
  if (frameCount % 60 == 0 && timer > 0) {
    timer--;
  }
  $("#timer-div").text(timer);
  if (timer == 0) {
    countVotes();
    noLoop();
  }
}
