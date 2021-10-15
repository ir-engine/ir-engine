const teamsNeededForStart = 4;
const timeOut = 1000
let gameRound = 0
let historyTemp = []

export function nextStep(state) {
  setTimeout(()=>{
    nextStepTimeout(state)
  }, timeOut)
}

function nextStepTimeout(state) {
    console.log('state.tournamentStage', '--- '+state.tournamentStage.value+' ---')

    if (state.tournamentStage.value === 'waitingPlayers' &&
        state.players.length != 0 &&
        state.players.length % teamsNeededForStart === 0) {
      state.tournamentStage.set('gameStart')
      drawTeams(state)

    } else if (state.tournamentStage.value === 'nextRound' && state.players.length > 1) {
      state.tournamentStage.set('gameStart')
      drawTeams(state)

    } else if (state.tournamentStage.value === 'gameStart' && state.players.length/2 === state.game.length ) {
      state.tournamentStage.set('teamsPlaying')
      chooseWinners(state)

    } else if (state.tournamentStage.value === 'gameResults') {
      //To DO: add action on all Players ready // 5 min timeout to change players in team
      addToHistory(state);
      state.game.set([])
      removeLosersFromPlayersList(state)
      if (state.gamesHistory.value[state.gamesHistory.length - 1].length === 1) {
        state.tournamentStage.set('finalResults')
      } else {
        // ROUND TWO
        gameRound++
        state.tournamentStage.set('nextRound')
        nextStep(state)
      }
    }
}

function removeLosersFromPlayersList(state) {
  const winnerTeams = state.players.value.filter(playerTeam => {
    return state.gamesHistory.value[gameRound].some(teamHistory => {
      console.log(teamHistory.winner.userId + '==='+ playerTeam.userId)
      return teamHistory.winner.userId === playerTeam.userId
    });
  })
  state.players.set(winnerTeams)
}

function drawTeams(state) {
   console.log('USERS: ',state.players)

   for(let i = 0; i < state.players.length; i+=2) {
    state.game.merge([
      {
        players: [state.players.value[i], state.players.value[i+1]],
        state: 'wait' // starting|playing|ended
      }
    ])
   }
   nextStep(state)
}


function chooseWinners(state) {
  state.game.forEach(teams => {
    const winner = winnerChooseAlgorithm(teams.players.value[0],teams.players.value[1])
    teams.state.set('ended')
    historyTemp.push({
      players: [teams.players.value[0], teams.players.value[1]],
      winner: teams.players.value[winner]
    })
  });
  state.tournamentStage.set('gameResults')
  nextStep(state)
}


function winnerChooseAlgorithm(firstTeam, secondTeam) {
  return Math.random()*2|0
}


function addToHistory(state) {
  state.gamesHistory[gameRound].merge(historyTemp)
  historyTemp = []
}