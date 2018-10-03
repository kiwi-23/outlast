var grid;
var players = 5;

var cost = 10;
var reward = 50;
var disutility = 30;

var dropdown = [players];
var input_name = [players];

function setup() {
  noCanvas();
  grid = new Grid(players);
  for (var i = 0; i < players; i++) {
    input_name[i] = createInput();
    input_name[i].parent("input-names-div");
    input_name[i].style("width", "10%");
  }
  for (var i = 0; i < players; i++) {
    var player = new Player(players-1, i);
    grid.addPlayer(player);
    dropdown[i] = createSelect();
    dropdown[i].parent("input-strategies-div");
    dropdown[i].option("not run");
    dropdown[i].option("run");
  }
  button = createButton("done!");
  button.parent("input-strategies-div");
  button.mousePressed(countVotes);
}

function Grid(players) {
  this.games = 0;
  this.matrix = [players];
  for (var i = 0; i < players; i++) {
    this.matrix[i] = [];
  }
  this.players = [];
  this.hashtable = {};
  this.candidates = [];
  this.noncandidates = [];
  this.winners = [];
  this.losers = [];
  this.eliminated = [];
  this.noneliminated = [];
  this.voteposition = [];
  for (var i = 0; i < players; i++) {
    this.voteposition[i] = [];
  }
  this.end = false;
}

function Player(indexr, indexc) {
  this.name = "";
  this.id = "";
  this.strategy = "not run";
  this.veto = false;
  this.row = indexr;
  this.col = indexc;
  this.money = 100;
  this.votes = 0;
  this.voters = [];
  this.eliminated = false;
}

Grid.prototype.addPlayer = function(p) {
  this.players.push(p);
  this.voteposition[players-1].push(p);
  var title = p.name;
  this.hashtable[title] = p;
}

function countVotes() {
  grid.games++;
  grid.reset();
  grid.sort();
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
  grid.payoffs();
  grid.rearrange();
  if (grid.games == 1)
    grid.drawGrid();
  for (var i = 0; i < grid.players.length; i++) {
    for (var j = 0; j < grid.players.length; j++) {
      grid.matrix[i][j].style("background-color", "#FFFFFF");
    }
  }
  for (var i = 0; i < grid.players.length; i++) {
    grid.matrix[grid.players[i].row][grid.players[i].col].style("background-color", "#000000");
  }
}

Grid.prototype.reset = function() {
  for (var i = 0; i < players; i++) {
    grid.players[i].name = input_name[i].value();
  }
  this.candidates = [];
  this.noncandidates = [];
  this.winners = [];
  this.losers = [];
}

Grid.prototype.sort = function() {
  var candidates = grid.candidates;
  var noncandidates = grid.noncandidates;
  for (var i = 0; i < players; i++) {
    grid.players[i].voters = [];
    grid.players[i].strategy = dropdown[i].value();
    if (grid.players[i].strategy == "run")
      candidates.push(grid.players[i]);
    else
      noncandidates.push(grid.players[i]);
  }
}

Grid.prototype.payoffs = function() {
  for (var i = 0; i < grid.candidates.length; i++) {
    grid.candidates[i].money -= cost;
  }
  if (grid.candidates.length == 1) {
    for (var i = 0; i < grid.noncandidates.length; i++) {
      grid.noncandidates[i].money -= disutility;
    }
    grid.candidates[0].money += reward;
  }
  else {
    for (var i = 0; i < grid.winners.length; i++) {
      grid.winners[i].money += reward / grid.winners.length;
      for (var j = 0; j < grid.winners[i].voters.length; j++) {
        grid.winners[i].voters[j].money += reward / (grid.winners.length * 2);
      }
    }
    for (var i = 0; i < grid.losers.length; i++) {
      grid.losers[i].money -= disutility;
      for (var j = 0; j < grid.losers[i].voters.length; j++) {
        grid.losers[i].voters[j].money -= disutility / (grid.losers.length * 2);
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

Grid.prototype.drawGrid = function() {
  for (var i = 0; i < players; i++) {
    var row = createElement("tr");
    row.addClass("grid-table-row");
    row.parent("grid-table");
    for (var j = 0; j < players; j++) {
      var cell = createElement("td");
      row.child(cell);
      grid.matrix[i].push(cell);
    }
  }
}
