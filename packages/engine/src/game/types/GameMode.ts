import { Checker } from '../../game/types/Checker'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor } from '../../ecs/functions/EntityFunctions'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export interface StateObject {
  components: string[]
  role: string
  uuid: string
  storage: StorageInterface[]
}

export interface StorageInterface {
  component: string
  variables: string
}

export interface InitStorageInterface {
  component: ComponentConstructor<any, any>
  variables: string[]
}

export interface GameMode {
  name: string
  priority: number
  preparePlayersRole?: (gameRules: GameMode, maxPlayerCount: any) => void
  onGameLoading?: (gameEntity: Entity) => void
  onGameStart?: (gameEntity: Entity) => void
  onBeforeExecute?: (gameEntity: Entity) => void
  onAfterExecute?: (gameEntity: Entity) => void
  beforePlayerLeave?: (gameEntity: Entity) => void
  onPlayerLeave?: (gameEntity: Entity, playerComponent, game) => void
  registerActionTagComponents: ComponentConstructor<any, any>[]
  registerStateTagComponents: ComponentConstructor<any, any>[]
  gamePlayerRoles: string[]
  gameObjectRoles: string[]
}