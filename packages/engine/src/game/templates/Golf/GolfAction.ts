export const GolfAction = {
  playerJoined(playerNetworkId: string) {
    return {
      type: 'puttclub.PLAYER_JOINED' as const,
      playerNetworkId
    }
  },

  playerStroke(playerNetworkId: string) {
    return {
      type: 'puttclub.PLAYER_STROKE' as const,
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
