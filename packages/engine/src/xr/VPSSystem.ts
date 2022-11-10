import { Quaternion, Vector3 } from 'three'

import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { World } from '../ecs/classes/World'
import { defineQuery, getComponentState, removeQuery } from '../ecs/functions/ComponentFunctions'
import { SCENE_COMPONENT_VPS_WAYSPOT, VPSActions, VPSWayspotComponent } from './VPSComponents'
import { updateWorldOrigin } from './XRAnchorSystem'

export default async function VPSSystem(world: World) {
  world.sceneComponentRegistry.set(VPSWayspotComponent.name, SCENE_COMPONENT_VPS_WAYSPOT)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VPS_WAYSPOT, {
    defaultData: {}
  })

  const vec3 = new Vector3()
  const quat = new Quaternion()

  const vpsWayspotQuery = defineQuery([VPSWayspotComponent])
  const vpsWayspotFoundQueue = createActionQueue(VPSActions.wayspotFound.matches)
  const vpsWayspotUpdatedQueue = createActionQueue(VPSActions.wayspotUpdated.matches)
  const vpsWayspotLostQueue = createActionQueue(VPSActions.wayspotLost.matches)

  const execute = () => {
    const wayspots = vpsWayspotQuery()

    for (const action of vpsWayspotFoundQueue()) {
      for (const entity of wayspots) {
        const wayspot = getComponentState(entity, VPSWayspotComponent)
        if (wayspot.name.value === action.name) wayspot.active.set(true)
      }
      updateWorldOrigin(world, vec3.copy(action.position), quat.copy(action.rotation))
    }

    for (const action of vpsWayspotUpdatedQueue()) {
      updateWorldOrigin(world, vec3.copy(action.position), quat.copy(action.rotation))
    }

    for (const action of vpsWayspotLostQueue()) {
      for (const entity of wayspots) {
        const wwayspot = getComponentState(entity, VPSWayspotComponent)
        if (wwayspot.name.value === action.name) wwayspot.active.set(false)
      }
    }
  }

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(VPSWayspotComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_VPS_WAYSPOT)
    removeActionQueue(vpsWayspotFoundQueue)
    removeActionQueue(vpsWayspotUpdatedQueue)
    removeActionQueue(vpsWayspotLostQueue)
    removeQuery(world, vpsWayspotQuery)
  }

  return { execute, cleanup, subsystems: [] }
}
