import { World } from '../ecs/classes/World'
import { SCENE_COMPONENT_VPS_WAYSPOT, VPSWayspotComponent } from './VPSComponents'

export default async function VPSSystem(world: World) {
  world.sceneComponentRegistry.set(VPSWayspotComponent.name, SCENE_COMPONENT_VPS_WAYSPOT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VPS_WAYSPOT, {
    defaultData: {}
  })

  const execute = () => {}

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(VPSWayspotComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_VPS_WAYSPOT)
  }

  return { execute, cleanup, subsystems: [] }
}
