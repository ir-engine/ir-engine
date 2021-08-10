import { Behavior } from '../../common/interfaces/Behavior'
import { Component } from '../../ecs/classes/Component'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces'
import { Checker } from '../../game/types/Checker'
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
  component: ComponentConstructor<Component<any>>
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
  registerActionTagComponents: ComponentConstructor<Component<any>>[]
  registerStateTagComponents: ComponentConstructor<Component<any>>[]
  gamePlayerRoles: string[]
  gameObjectRoles: string[]
}

export interface RoleBehaviorWithTarget {
  sortMethod?: any
  targetsRole: {
    [key: string]: {
      watchers?: ComponentConstructor<Component<any>>[][]
      checkers?: Array<{
        function: Checker
        args?: any
      }>
      args?: any
    }
  }
}

export type RoleBehaviorTarget = (entity: Entity) => Entity

export interface RoleBehaviors {
  [key: string]: Array<{
    behavior: any
    prepareArgs?: any
    args?: any | ((entity: Entity) => void)
    watchers?: ComponentConstructor<Component<any>>[][]
    checkers?: Array<{
      function: Checker
      args?: any
    }>
    takeEffectOn?: RoleBehaviorWithTarget | RoleBehaviorTarget
  }>
}

export interface GameRolesInterface {
  [key: string]: RoleBehaviors
}
