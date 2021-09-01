export const GolfAction = {
  sendState(state: any) {
    return {
      type: 'puttclub.GAME_STATE' as const,
      state
    }
  },

  addHole(number: number, par: number) {
    return {
      type: 'puttclub.SET_HOLES' as const
    }
  },

  playerJoined(playerId: string) {
    return {
      type: 'puttclub.PLAYER_JOINED' as const,
      playerId
    }
  },

  playerReady(playerId: string) {
    return {
      type: 'puttclub.PLAYER_READY' as const,
      playerId
    }
  },

  playerStroke(playerId: string) {
    return {
      type: 'puttclub.PLAYER_STROKE' as const,
      playerId
    }
  },

  ballStopped(playerId: string, position: [number, number, number], inHole: boolean, outOfBounds: boolean) {
    return {
      type: 'puttclub.BALL_STOPPED' as const,
      playerId,
      position,
      inHole,
      outOfBounds
    }
  },

  nextTurn() {
    return {
      type: 'puttclub.NEXT_TURN' as const
    }
  },

  resetBall(playerId: string, position: [number, number, number]) {
    return {
      type: 'puttclub.RESET_BALL' as const,
      playerId,
      position
    }
  },

  nextHole() {
    return {
      type: 'puttclub.NEXT_HOLE' as const
    }
  },

  toggleScorecard() {
    return {
      type: 'puttclub.TOGGLE_SCORECARD' as const
    }
  }
}

export type GolfActionType = ReturnType<typeof GolfAction[keyof typeof GolfAction]>
