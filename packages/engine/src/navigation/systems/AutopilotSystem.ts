import { identity } from 'lodash'
import { Vector3 } from 'three'
import { Path } from 'yuka'

import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { addComponent, defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { GamepadAxis } from '../../input/enums/InputEnums'
import { InputType } from '../../input/enums/InputType'
import { InputValue } from '../../input/interfaces/InputValue'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { findClosestProjectedPoint } from '../functions/findProjectedPoint'
import { getInputVector } from '../functions/inputFunctions'
import { updatePath } from '../functions/pathFunctions'

export default async function AutopilotSystem(world: World) {
  const navmeshesQuery = defineQuery([NavMeshComponent, Object3DComponent])
  const requestsQuery = defineQuery([AutoPilotRequestComponent])
  const autopilotQuery = defineQuery([AutoPilotComponent])

  const inputState: InputValue = {
    type: InputType.TWODIM,
    value: [0, 0, 0],
    lifecycleState: LifecycleValue.Unchanged
  }
  // TODO necessary?
  Engine.instance.currentWorld.inputState.set(GamepadAxis.Left, inputState)

  return () => {
    const entsWithNavMesh = navmeshesQuery()

    const surfaces = entsWithNavMesh
      .map((navMeshEntity) => getComponent(navMeshEntity, Object3DComponent).value)
      .filter(identity)

    for (const avatarEntity of requestsQuery.enter()) {
      const { unprojectedPoint } = getComponent(avatarEntity, AutoPilotRequestComponent)

      const [goalPoint, closestNavMeshIndex] = findClosestProjectedPoint(
        Engine.instance.currentWorld.camera,
        surfaces,
        unprojectedPoint
      )

      if (goalPoint) {
        const closestNavMeshEntity = entsWithNavMesh[closestNavMeshIndex]
        const avatarPosition = getComponent(avatarEntity, TransformComponent).position

        addComponent(avatarEntity, AutoPilotComponent, {
          // TODO do we need goalPoint to be a property?
          endPoint: goalPoint,
          path: new Path()
        })

        updatePath(
          getComponent(avatarEntity, AutoPilotComponent).path,
          getComponent(closestNavMeshEntity, NavMeshComponent).value,
          avatarPosition,
          goalPoint
        )
      }

      removeComponent(avatarEntity, AutoPilotRequestComponent)
    }

    const allOngoing = autopilotQuery(world)
    for (const avatarEntity of allOngoing) {
      const path = getComponent(avatarEntity, AutoPilotComponent).path
      if (path.finished()) {
        removeComponent(avatarEntity, AutoPilotComponent)
        inputState!.value[0] = 0
        inputState!.value[1] = 0
        inputState!.value.length = 2
      } else {
        const position = getComponent(avatarEntity, TransformComponent).position
        const inputVec = getInputVector(
          path.current() as unknown as Vector3,
          position,
          Engine.instance.currentWorld.camera
        )

        const inputAngle = Math.atan2(inputVec.z, inputVec.y)

        inputState!.value[0] = inputVec.x
        inputState!.value[1] = inputVec.y
        inputState!.value[2] = inputAngle
      }
      inputState!.lifecycleState = LifecycleValue.Changed
      path.advance()
    }
  }
}
