import { createActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { updateNavMesh } from '../../scene/functions/loaders/NavMeshFunctions'

// TODO merge AutoPilotSystem with NavigationSystem?
export default async function NavigationSystem(_: World) {
  const queryNavMesh = defineQuery([NavMeshComponent])
  const queryNavMeshAndObject3D = defineQuery([NavMeshComponent, Object3DComponent])

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  return () => {
    const entsWithNavMesh = queryNavMesh()
    const entsWithNavMeshAndObject3DEnter = queryNavMeshAndObject3D.enter()

    const modifyPropertyActions = modifyPropertyActionQueue()

    for (const action of modifyPropertyActions) {
      for (const entity of action.entities) {
        if (entsWithNavMesh.includes(entity)) updateNavMesh(entity)
      }
    }

    for (const entity of entsWithNavMeshAndObject3DEnter) {
      updateNavMesh(entity)
    }
  }
}
