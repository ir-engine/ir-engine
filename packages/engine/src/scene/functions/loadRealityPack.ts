import { Entity } from '../../ecs/classes/Entity'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import * as packs from '@xrengine/realitypacks/packs'

/**
 * @author Abhishek Pathak
 * @param sceneLoader
 * @param entity
 * @param component
 * @param sceneProperty
 */
export const loadRealityPack = (
  sceneLoader: WorldScene,
  entity: Entity,
  component: SceneDataComponent,
  sceneProperty: ScenePropertyType
) => {
  const packName = 'test'
  const pack = packs[packName]
  if (!pack) {
    console.log('Reality Packs Not Found!!')
    return
  }
  //Do things with Reality Pack
  /////
}
