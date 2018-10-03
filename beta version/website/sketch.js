var socket;
var data2;

var player;
var matrix = [];

var time = 5;

var otherplayers = [];

var chosen = false;
var chosen1 = false;

function Player() {
  this.name = "";
  this.id = "";
  this.row = 0;
  this.col = 0;
  this.money = 100;
  this.votes = 0;
  this.voters = [];
  this.strategy = "not run";
  this.veto = false;
  this.vetocount = 1;
  this.eliminated = false;
  this.vetocounter = false;
}

function setup() {
  socket = io.connect();
  player = new Player();
  socket.on("startGame", startGame);
  socket.on("changeName", function(data) {
    $("#change-name-div").fadeIn(200);
  });
  socket.on("ongoingGame", function(data) {
    alert("A game is in progress. You cannot join an ongoing game.");
  });
  socket.on("lessPlayers", function(data, num) {
    $("#less-players-div").text("You require " + (5 - num) + " more players to start the game.");
    $("#less-players-div").fadeIn(200);
  });
  socket.on("initialPosition", initialPosition);

  noLoop();
  $("#votes-aggregate-div").text("Votes accumulated : " + player.votes);
  $("#money-aggregate-div").text("Money remaining : $" + player.money);

  $("#start-button").click(function() {
    var namefield = select("#input-name");
    player.name = namefield.value();
    socket.emit("newPlayer", player);
  });

  $("#button-run").click(function() {
    if (player.eliminated == false) {
      $(this).css({
        "background-color": "#FFFFFF",
        "color": "#000000",
        "border": "1px solid #000000"
      });
      $("#button-notrun").css({
        "background-color": "#000000",
        "color": "#FFFFFF",
      });
      strategyChoice("run");
    }
  });

  $("#button-notrun").click(function() {
    if (player.eliminated == false) {
      $(this).css({
        "background-color": "#FFFFFF",
        "color": "#000000",
        "border": "1px solid #000000"
      });
      $("#button-run").css({
        "background-color": "#000000",
        "color": "#FFFFFF",
      });
      strategyChoice("not run");
    }
  });

  $("#button-veto").click(function() {
    player.veto = true;
    player.vetocount--;
    chosen1 = true;
    $(".veto-div").fadeOut();
    socket.emit("countVeto", player);
  });

  socket.on("inputVeto", inputVeto);
  socket.on("displayStats", printStats);
  socket.on("eliminatedPlayer", function(data) {
    player = data.hashtable[player.name];
    alert("You are eliminated from the game.");
  });
  socket.on("endGame", endGame);
}

function startGame(data) {
  $("#change-name-div").fadeOut(200);
  $("#less-players-div").fadeOut(200);
  $(".landing-div").fadeOut(200, function() {
    $(".gameplay-div").fadeIn();
    loop();
  });
}

function initialPosition(data) {
  player = data.hashtable[player.name];
  for (var i = 0; i < data.players.length; i++) {
    if (data.players[i].name == data.hashtable[player.name].name) {
      player.row = data.players.length - 1;
      player.col = i;
    }
  }
  socket.emit("initialPosition", player);
}

function strategyChoice(choice) {
  player.strategy = choice;
  $(".strategy-button").fadeOut(200);
  socket.emit("inputStrategies", player);
  chosen = true;
}

function inputVeto(data) {
  player.vetocounter = true;
  time = 5;
  loop();
  if (player.vetocount == 0) {
    $("veto-p").text("Veto this round? (You have used your veto chance.)");
    $("#button-veto").css({
      "background-color": "#FFFFFF",
      "color": "#000000",
      "border": "1px solid #000000"
    });
  }
  $(".veto-div").fadeIn(200);
}

function printStats(data) {
  data2 = data;
  player = data.hashtable[player.name];
  if (data.games == 1) {
    drawGrid(data);
  }
  for (var i = 0; i < data.players.length; i++) {
    for (var j = 0; j < data.players.length; j++) {
      matrix[i][j].style("background-color", "#FFFFFF");
      matrix[i][j].style("color", "#000000");
      matrix[i][j].html("<br>");
    }
  }
  for (var i = 0; i < data.players.length; i++) {
    matrix[data.players[i].row][data.players[i].col].html(i+1);
  }
  matrix[player.row][player.col].style("background-color", "#000000");
  matrix[player.row][player.col].style("color", "#FFFFFF");
  $("#positioning-div").fadeIn(200);
  if(data.games == 1) {
    for (var i = 0; i < data.players.length; i++) {
      var player_select = createButton(data.players[i].name);
      player_select.style("background-color", "#000000");
      player_select.style("color", "#FFFFFF");
      player_select.style("padding", "5px 15px");
      player_select.style("margin", "2% 1% 0 0");
      player_select.style("box-shadow", "none");
      player_select.style("border", "1px solid transparent");
      player_select.style("border-radius", "2px");
      player_select.style("font-size", "0.8rem");
      player_select.style("letter-spacing", "1px");
      player_select.style("cursor", "pointer");
      player_select.addClass("other-players-select-button");
      player_select.parent("other-players-select");
      otherplayers.push(player_select);
    }
  }
  else {
    for (var i = 0; i < otherplayers.length; i++) {
      $(".other-players-select-button").eq(i).text(data.players[i].name);
    }
  }
  $("#other-players-select-div").fadeIn(200);
  $("#other-players-stats-div").fadeIn(200);
  $(".other-players-select-button").click(function() {
    $(".other-players-select-button").css({
      "background-color": "#000000",
      "color": "#FFFFFF"
    });
    $(this).css({
      "background-color": "#FFFFFF",
      "color": "#000000"
    });
    var index = $(this).index();
    otherStats(index);
  });
  time = 5;
  $(".strategy-button").css({
    "background-color": "#000000",
    "color": "#FFFFFF"
  });
  if (player.eliminated == true) {
    $("#eliminated-div").fadeIn(200);
    $(".strategy-button").css({
      "background-color": "#FFFFFF",
      "color": "#000000",
      "border": "1px solid #525252"
    });
  }
  $(".strategy-button").fadeIn(200);
  player.strategy = "not run";
  $("#votes-aggregate-div").text("Votes accumulated : " + player.votes);
  $("#money-aggregate-div").text("Money remaining : $" + player.money);
  $(".other-players-div").fadeIn();
  loop();
}

function otherStats(index) {
  $("#other-name").text("Player name : " + data2.players[index].name);
  // $("#other-position").text("Position : " + data2.players[index].position);
  // $(".other-money").text("Money : " + data.players[index].money);
  $("#other-votes").text("Votes Accumalated : " + data2.players[index].votes);
  $("#other-strategy").text("Strategy : " + data2.players[index].strategy);
  $("#other-veto").text("Veto : " + data2.players[index].veto);
  $("#other-status").text("Eliminated : " + data2.players[index].eliminated);
}

function drawGrid(data) {
  var wid = $("#grid-table").innerWidth();
  $("#grid-table").css({"margin-left": (windowWidth - wid) / 2});
  for (var i = 0; i < data.players.length; i++) {
    matrix[i] = [];
  }
  for (var i = 0; i < data.players.length; i++) {
    var row = createElement("tr");
    row.addClass("grid-table-row");
    row.parent("grid-table");
    for (var j = 0; j < data.players.length; j++) {
      var cell = createElement("td");
      cell.html("<br>");
      row.child(cell);
      console.log()
      matrix[i].push(cell);
    }
  }
}

function endGame(data, message) {
  data2 = data;
  player = data.hashtable[player.name];
  if (player.eliminated == true) {
    $("#eliminated-div").fadeIn(200);
  }
  $("#timer-div").fadeOut(200);
  $("#votes-aggregate-div").text("Votes accumulated : " + player.votes);
  $("#money-aggregate-div").text("Money remaining : $" + player.money);
  $("#votes-aggregate-div").fadeIn(200);
  $("#money-aggregate-div").fadeIn(200);
  $(".strategy-button").fadeOut(200);
  $(".veto-div").fadeOut(200);
  $(".positioning-div").fadeOut(200);
  $(".other-players-select-div").fadeOut(200);
  $(".other-players-stats-div").fadeOut(200);
  alert(message);
  noLoop();
}

function draw() {
  if (frameCount % 60 == 0 && time > 0) {
    time--;
  }
  $("#timer-div").text(time);
  if (time == 0) {
    if (player.vetocounter == true) {
      $(".veto-div").fadeOut(200);
      player.vetocounter = false;
      if (chosen1 == false) {
        socket.emit("countVeto", player);
      }
      chosen1 = false;
      noLoop();
    }
    else {
      $(".strategy-button").fadeOut();
      noLoop();
      if (chosen == false) {
        socket.emit("inputStrategies", player);
      }
      chosen = false;
    }
  }
}
