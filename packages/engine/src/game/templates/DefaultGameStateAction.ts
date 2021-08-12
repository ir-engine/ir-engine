/*
export enum DefaultGameStateAction {
  onGameStarted,
  onGameEnded,
  onRoundStarted,
  onRoundEnded,
  onPlayerTurnStarted,
  onPlayerTurnEnded,
  onPlayerJoined,
  onPlayerLeft,
  onPlayerScored,
  onPlayerAttempted,
  // onObjectOutOfBounds,
  // onVote
}
*/
export enum ClientActionToServer {
  requireState,
  requireObjects,
  sendVelocity
}
