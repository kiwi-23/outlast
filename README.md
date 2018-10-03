<h1><a href="https://outlast-game.herokuapp.com/">Outlast</a></h1>
<p><b>Outlast is a multi-player strategic game where the players compete against each other in multiple rounds of an election process.</b></p>

<br>
<h2>Abstract</h2>
<p>
It is a non-cooperative tactical game founded on an electoral competition model that requires the players to strategize and make deliberate decisions, along with negotiations and threats towards the other players in order to avoid elimination and earn more money in the continuous election rounds.
<br><br>
The framework makes use of the Candidate-Voter Model, an electoral competition model studied in Political Science and Economics to illustrate the situation of multiple <a href="https://en.wikipedia.org/wiki/Nash_equilibrium">Nash Equilibria</a>. The model is a variation of the popular Hotelling-Downs model <a href="https://en.wikipedia.org/wiki/Median_voter_theorem">(Median Voter Theorem)</a>. 
<br><br>
The Hotelling-Downs model assumed that all the candidates could be placed on a linear political spectrum indicating the “party ideology” they embodied, and all the voters would vote for the contender closest to them on the spectrum.
</p>

<h2>Structure</h2>

<h3>Players</h3>
<p>Players = {1, 2, 3, 4, 5, … n}, where n >= 5</p>

<h3>Strategies</h3>
<p>
For each player, there is a pure strategy set S<sub>p</sub>, and S<sub>1</sub> = S<sub>2</sub> = S<sub>3</sub> = S<sub>4</sub> = … S<sub>n</sub>.
<br><br>
Each player’s strategy set includes just two options of whether they should run as a candidate for the election or not.
<br><br>
S<sub>p</sub> = {run, not run}
</p>

<h3>Vote Distribution</h3>
<p>On a spectrum with 7 players, where each player would vote for the candidate closest to them:</p>
<br>
<table>
<tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td style="background-color: #F3F3F3;">6</td><td>7</td></tr>
</table>
<p>If player 3 and player 6 were to run as candidates for the election, player 3 would win by receiving the three votes of players 1, 2, and 4, while player 6 would only be receiving the 2 votes of players 5 and 7.
<br><br>
Therefore, players 1, 2, and 4 would be supporting a winning candidate and and players 5, and 7 would be supporting a losing candidate.
</p>

<h3>Payoffs</h3>
<p>The payoff functions for each player for the four possibilities in the gameplay are as follows: 
<br>
<ui>
<li><b>Run (& Win) :</b> + Reward - Cost of Running</li>
<li><b>Run (& Lose) :</b> - Disutility - Cost of Running</li>
<li><b>Don't Run (& Support Winning Candidate) :</b> + Reward / No. of positions between player and winning candidate</li>
<li><b>Don't Run (& Support Losing Candidate) :</b> - Disutility / No. of positions between player and losing candidate</li>
</ui>
</p>

<h2>Setup</h2>
<p>To play Outlast, you require:</p>
<ul>
<li>5 or more players 
<li>the physical spectrum</li>
<li>player pieces</li> 
<li>poker chips of the denomination- 1, 5, 10, 20 and 50</li>
</ul>
<p>Each player will require a phone or any device with the browser window open to <a href="https://outlast-game.herokuapp.com">this page</a>.
<br><br><br>
For more details about setup and preparations, read the rulebook.</p>
