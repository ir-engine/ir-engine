


export interface StorageElement {
  component: string
  variables: string
}

export interface GameState {
  uuid: string
  components: string[]
  storage: StorageElement[]
}

export interface GameStateActionMessage {
  game: string
  role: string
  component: string
  uuid: string
}

export interface GameStateUpdateMessage {
  game: string
  state: GameState[]
}
