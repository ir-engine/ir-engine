const teamsNeededForStart = 8;
let gameRound = 0

export function nextStep(state) {
    // TO DO: use matches stuff
    if (state.tournamentStage === 'waitingPlayers' && state.players === teamsNeededForStart) {
      state.tournamentStage.set('gameStart')
      drawTeams(state)

    } else if (state.tournamentStage === 'gameStart' && state.players.length/2 === state.game.length ) {
      state.tournamentStage.set('teamsPlaying')
      chooseWinners(state)

    } else if (state.tournamentStage === 'gameResults') {// if one player left, its final winner
      //To DO: add action on all Players ready // 5 min timeout to change players in team
      // ROUND TWO
      removeLosersFromPlayersList(state)
      state.game.set([])
      gameRound++
      state.tournamentStage.set('waitingPlayers')
      
    } else if (state.tournamentStage === 'gameResults' && state.gamesHistory[state.gamesHistory.length - 1].length === 1) {
      state.tournamentStage.set('finalResults')
    }
    
}

function removeLosersFromPlayersList(state) {
  const winnerTeams = state.players.filter(playerTeam => {
    return state.gamesHistory[gameRound].some(teamHistory => {
      teamHistory.winner.userId === playerTeam.userId
    });
  })
  state.players.set(winnerTeams)
}

function drawTeams(state) {
   console.log('state.players',state.players)

   for(let i = 0; i < state.players.length; i+=2) {
    state.game.merge([
      {
        players: [state.players[i], state.players[i+1]],
        state: 'wait' // starting|playing|ended
      }
    ])
   }
   nextStep(state)
}


function chooseWinners(state) {
  state.game.forEach(teams => {
    const winner = winnerChooseAlgorithm(teams.players[0],teams.players[1])
    teams.state.set('ended')
    addToHistory(state, [teams.players[0],teams.players[1]], winner)
  });
  state.tournamentStage.set('gameResults')
  nextStep(state)
}


function winnerChooseAlgorithm(firstTeam, secondTeam) {
  return Math.random()*2|0
}


function addToHistory(state, teams, winner) {
  state.gamesHistory[gameRound].merge(
    {
      players: [state.players[0], state.players[1]],
      winner: teams.players[winner]
    }
  )
}