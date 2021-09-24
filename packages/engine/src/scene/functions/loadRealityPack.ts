import { Entity } from '../../ecs/classes/Entity'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'
import importPack from '@xrengine/realitypacks/packs'

/**
 * @author Abhishek Pathak
 * @param sceneLoader
 * @param entity
 * @param component
 * @param sceneProperty
 */
export const loadRealityPack = async (
  sceneLoader: WorldScene,
  entity: Entity,
  component: SceneDataComponent,
  sceneProperty: ScenePropertyType
) => {
  const { default: realityPack } = await importPack(component.data.packName)
  const loadedSystem = await realityPack(useWorld(), component.data.args)
  const pipeline = component.data.pipeline ?? 'FIXED'
  useWorld().injectedSystems[pipeline].push(loadedSystem)
}
