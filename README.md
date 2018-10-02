<h1><a href="https://outlast-game.herokuapp.com/">Outlast</a></h1>
<b>Outlast is a multi-player strategic game where the players compete against each other in multiple rounds of an election process.</b>

<br>

<h2>Abstract</h2>
It is a non-cooperative tactical game founded on an electoral competition model that requires the players to strategize and make deliberate decisions, along with negotiations and threats towards the other players in order to avoid elimination and earn more money in the continuous election rounds.
<br><br>
The framework makes use of the Candidate-Voter Model, an electoral competition model studied in Political Science and Economics to illustrate the situation of multiple <a href="https://en.wikipedia.org/wiki/Nash_equilibrium">Nash Equilibria</a>. The model is a variation of the popular Hotelling-Downs model <a href="https://en.wikipedia.org/wiki/Median_voter_theorem">(Median Voter Theorem)</a>. 
<br><br>
The Hotelling-Downs model assumed that all the candidates could be placed on a linear political spectrum indicating the “party ideology” they embodied, and all the voters would vote for the contender closest to them on the spectrum.

<h2>Structure</h2>

<h4>Players</h4>
Players = {1, 2, 3, 4, 5, … n}, where n >= 5 

<br>

<h4>Strategies</h4>
For each player, there is a pure strategy set S<sub>p</sub>, and S<sub>1</sub> = S<sub>2</sub> = S<sub>3</sub> = S<sub>4</sub> = … S<sub>n</sub>.
<br><br>
Each player’s strategy set includes just two options of whether they should run as a candidate for the election or not.
<br><br>
S<sub>p</sub> = {run, not run}

<br>

<h4>Payoffs</h4>
