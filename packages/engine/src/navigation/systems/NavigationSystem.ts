import { createActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { updateNavMesh } from '../../scene/functions/loaders/NavMeshFunctions'

export default async function AutopilotSystem(_: World) {
  const navMeshQuery = defineQuery([NavMeshComponent])

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  return () => {
    const navMeshEnts = navMeshQuery()

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (navMeshEnts.includes(entity)) updateNavMesh(entity)
      }
    }
  }
}
