import { State } from '@hookstate/core'

import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'

import { initializeSceneEntity } from '../functions/EntityTree'
import { unloadAllSystems } from '../functions/SystemFunctions'
import { Entity, UndefinedEntity } from './Entity'

export const CreateScene = Symbol('CreateScene')

/** @todo rename Scene */
export class Scene {
  private constructor() {
    // @todo do this as the scene loads instead of world creation
    initializeSceneEntity(this)
  }

  static [CreateScene] = () => new Scene()

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

export function createScene() {
  return Scene[CreateScene]()
}

export function destroyScene(scene: Scene) {
  unloadAllSystems(true)
}
