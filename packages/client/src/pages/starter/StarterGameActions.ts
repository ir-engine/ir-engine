export const StarterAction = {
  playerJoined(playerId: string) {
    return {
      type: 'starter.PLAYER_JOINED' as const,
      playerId
    }
  }
}

export type StarterActionType = ReturnType<typeof StarterAction[keyof typeof StarterAction]>
