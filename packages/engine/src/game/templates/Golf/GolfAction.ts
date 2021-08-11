export const GolfAction = {
  playerJoined(playerNetworkId: number) {
    return {
      type: 'puttclub.PLAYER_JOINED' as const,
      playerNetworkId
    }
  },

  playerStroke(playerNetworkId: number) {
    return {
      type: 'puttclub.PLAYER_STORE' as const,
      playerNetworkId
    }
  },

  nextTurn() {
    return {
      type: 'puttclub.NEXT_TURN' as const
    }
  },

  resetBall() {
    return {
      type: 'puttclub.RESET_BALL' as const
    }
  },

  nextHole() {
    return {
      type: 'puttclub.NEXT_HOLE' as const
    }
  }
}

export type GolfActionType = ReturnType<typeof GolfAction[keyof typeof GolfAction]>
