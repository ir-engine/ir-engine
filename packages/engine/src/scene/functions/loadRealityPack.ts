import { Entity } from '../../ecs/classes/Entity'
import { ScenePropertyType, WorldScene } from '../functions/SceneLoading'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { importPack } from '@xrengine/realitypacks/loader'

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
  const moduleEntryPoints = await importPack(component.data.packName)
  for (const entryPoint of moduleEntryPoints) {
    const loadedSystem = await (await entryPoint).default(useWorld(), component.data.args)
    const pipeline = component.data.pipeline ?? 'FIXED'
    useWorld().injectedSystems[pipeline].push(loadedSystem)
  }
}
