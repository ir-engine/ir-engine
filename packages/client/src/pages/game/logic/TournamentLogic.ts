const teamsNeededForStart = 2;
const timeOut = 5000
let gameRound = 0
let historyTemp = []

export function nextStep(state) {
  setTimeout(()=>{
    nextStepTimeout(state)
  }, timeOut)
}

function nextStepTimeout(state) {
    // TO DO: use matches stuff
    console.log('state.tournamentStage', state.tournamentStage.value)
    if (state.tournamentStage.value === '--- waiting players ---' &&
        state.players.length != 0 &&
        state.players.length % teamsNeededForStart === 0) {
      state.tournamentStage.set('--- Game Start ---')
      drawTeams(state)

    } else if (state.tournamentStage.value === '--- Game Start ---' && state.players.length/2 === state.game.length ) {
      state.tournamentStage.set('--- Playing ---')
      chooseWinners(state)

    } else if (state.tournamentStage.value === '--- Results ---') {// if one player left, its final winner
      //To DO: add action on all Players ready // 5 min timeout to change players in team
      // ROUND TWO
      addToHistory(state);
      state.game.set([])
      removeLosersFromPlayersList(state)
      if (state.tournamentStage.value === '--- Results ---' &&
        state.gamesHistory.value[state.gamesHistory.length - 1].length === 1) {
        state.tournamentStage.set('--- Final Results ---')
      } else {
        gameRound++
        state.tournamentStage.set('--- waiting players ---')
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
    const winner = winnerChooseAlgorithm(teams.players[0],teams.players[1])
    teams.state.set('ended')
    historyTemp.push({
      players: [state.players.value[0], state.players.value[1]],
      winner: state.players.value[winner]
    })
  });
  state.tournamentStage.set('--- Results ---')
  nextStep(state)
}


function winnerChooseAlgorithm(firstTeam, secondTeam) {
  return Math.random()*2|0
}


function addToHistory(state) {
  state.gamesHistory[gameRound].merge(historyTemp)
  historyTemp = []
}