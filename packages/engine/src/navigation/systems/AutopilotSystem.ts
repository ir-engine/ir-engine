import multiLogger from '@xrengine/common/src/logger'
import { createActionQueue } from '@xrengine/hyperflux'

import { step } from '../../common/functions/EntityStateMachineFunctions'
import { DebugAutoPilotComponent } from '../../debug/DebugAutoPilotComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { EngineRendererAction } from '../../renderer/EngineRendererState'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { AtRestState } from '../AutoPilotStates'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { INITIAL_SPEED, MAX_SPEED, MIN_SPEED } from '../constants'

let debugMode = false

export default async function AutopilotSystem(world: World) {
  const navmeshesQuery = defineQuery([NavMeshComponent, Object3DComponent])
  const requestsQuery = defineQuery([AutoPilotRequestComponent])
  const autopilotQuery = defineQuery([AutoPilotComponent])
  const getDebugActionQueue = createActionQueue(EngineRendererAction.setNavigationDebug.matches)

  return () => {
    const navMeshEntities = navmeshesQuery()
    const debugActions = getDebugActionQueue()
    debugMode = debugActions.length > 0 ? debugActions[debugActions.length - 1].navigationDebugEnable : debugMode

    for (let navMeshEntity of navMeshEntities) {
      if (debugMode) {
        setComponent(navMeshEntity, DebugNavMeshComponent, {})
      } else {
        removeComponent(navMeshEntity, DebugNavMeshComponent)
      }
    }

    for (const avatarEntity of requestsQuery.enter()) {
      if (debugMode) {
        // Need to remove because the debug system only cleans up existing helpers on exit
        removeComponent(avatarEntity, DebugAutoPilotComponent)
        setComponent(avatarEntity, DebugAutoPilotComponent, {})
      }
      setComponent(avatarEntity, AutoPilotComponent, {
        state: AtRestState,
        navMeshEntities,
        closestNavMeshIndex: -1,
        path: [],
        pathIndex: 0,
        speed: INITIAL_SPEED,
        maxSpeed: MAX_SPEED,
        minSpeed: MIN_SPEED
      })
    }

    const allOngoing = autopilotQuery(world)
    for (const avatarEntity of allOngoing) {
      const autoPilot = getComponent(avatarEntity, AutoPilotComponent)
      multiLogger.debug('CURRENT AUTOPILOT STATE', autoPilot.state.name)
      autoPilot.state = step(autoPilot.state, avatarEntity)
      if (autoPilot.state === AtRestState) {
        removeComponent(avatarEntity, DebugAutoPilotComponent)
      }
    }
  }
}
