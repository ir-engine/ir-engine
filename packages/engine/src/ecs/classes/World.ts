import { State } from '@hookstate/core'

import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'

import { initializeSceneEntity } from '../functions/EntityTree'
import { unloadAllSystems } from '../functions/SystemFunctions'
import { Entity, UndefinedEntity } from './Entity'

export const CreateWorld = Symbol('CreateWorld')
/** @todo rename Scene */
export class World {
  private constructor() {
    // @todo do this as the scene loads instead of world creation
    initializeSceneEntity(this)
  }

  static [CreateWorld] = () => new World()

  /**
   * The scene entity
   *  @todo support multiple scenes
   */
  sceneEntity: Entity = UndefinedEntity

  sceneJson = null! as SceneJson

  sceneMetadataRegistry = {} as Record<
    string,
    {
      state: State<any>
      default: any
    }
  >
}

export function createWorld() {
  return World[CreateWorld]()
}

export function destroyWorld(world: World) {
  unloadAllSystems(true)
  /** @todo this is broken - re-enable with next bitecs update */
  // bitecs.deleteWorld(world)
}
