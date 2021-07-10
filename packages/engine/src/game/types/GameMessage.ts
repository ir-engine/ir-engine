/**
 * @author HydraFire <github.com/HydraFire>
 */

export interface ClientGameActionMessage {
  type: string
  game: string
  ownerId: string
  uuid: string
}

export interface StorageElement {
  component: string
  variables: string
}

export interface GameState {
  uuid: string
  role: string
  components: string[]
  storage: StorageElement[]
}

export interface GameStateActionMessage {
  game: string
  role: string
  component: string
  uuid: string
  componentArgs: string
}

export interface GameStateUpdateMessage {
  game: string
  ownerId: string
  state: GameState[]
}
