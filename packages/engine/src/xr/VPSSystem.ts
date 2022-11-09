import { World } from '../ecs/classes/World'
import { SCENE_COMPONENT_VPS_WAYPOINT, VPSWaypointComponent } from './VPSComponents'

export default async function VPSSystem(world: World) {
  world.sceneComponentRegistry.set(VPSWaypointComponent.name, SCENE_COMPONENT_VPS_WAYPOINT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VPS_WAYPOINT, {
    defaultData: {}
  })

  const execute = () => {}

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(VPSWaypointComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_VPS_WAYPOINT)
  }

  return { execute, cleanup, subsystems: [] }
}
