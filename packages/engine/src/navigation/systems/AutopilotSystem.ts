import { NavMesh, Vector3 as YukaVector3, Path } from 'yuka'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NavMeshComponent } from '../component/NavMeshComponent'
import { Raycaster, Vector3 } from 'three'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { InputType } from '../../input/enums/InputType'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { GamepadAxis } from '../../input/enums/InputEnums'
import { NumericalType } from '../../common/types/NumericalTypes'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AutoPilotClickRequestComponent } from '../component/AutoPilotClickRequestComponent'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { defineQuery, defineSystem, enterQuery, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'

const findPath = (navMesh: NavMesh, from: Vector3, to: Vector3): Path => {
  const points = navMesh.findPath(new YukaVector3(from.x, from.y, from.z), new YukaVector3(to.x, to.y, to.z))

  const path = new Path()
  for (const point of points) {
    path.add(point)
  }
  return path
}

export const AutopilotSystem = async (): Promise<System> => {
  const raycaster = new Raycaster()

  const navmeshesQuery = defineQuery([NavMeshComponent, Object3DComponent])
  const navmeshesAddQuery = enterQuery(navmeshesQuery)
  
  const requestsQuery = defineQuery([AutoPilotRequestComponent])
  const requestsAddQuery = enterQuery(requestsQuery)
  
  const ongoingQuery = defineQuery([AutoPilotComponent])
  
  const navClickQuery = defineQuery([LocalInputReceiverComponent, AutoPilotClickRequestComponent])
  const navClickAddQuery = enterQuery(navClickQuery)
  
  return defineSystem((world: ECSWorld) => {

    const { delta } = world

    for (const entity of navClickAddQuery(world)) {
      const { coords } = getComponent(entity, AutoPilotClickRequestComponent)
      // console.log('~~~ coords', coords)
      raycaster.setFromCamera(coords, Engine.camera)

      const raycasterResults = []
      const clickResult = navmeshesQuery(world).reduce(
        (previousEntry, currentEntity) => {
          const mesh = getComponent(currentEntity, Object3DComponent).value
          raycasterResults.length = 0
          raycaster.intersectObject(mesh, true, raycasterResults)
          if (!raycasterResults.length) {
            return previousEntry
          }

          if (raycasterResults[0].distance < previousEntry.distance) {
            return {
              distance: raycasterResults[0].distance,
              point: raycasterResults[0].point,
              entity: currentEntity
            }
          }

          return previousEntry
        },
        { distance: Infinity, point: null, entity: null }
      )
      // console.log('~~~ clickResult', clickResult)

      if (clickResult.point) {
        console.log('ADD AutoPilotRequestComponent')
        addComponent(entity, AutoPilotRequestComponent, {
          point: clickResult.point,
          navEntity: clickResult.entity
        })
      }

      removeComponent(entity, AutoPilotClickRequestComponent)
    }

    // requests
    // generate path from target.graph and create new AutoPilotComponent (or reuse existing)
    for (const entity of requestsAddQuery(world)) {
      const request = getComponent(entity, AutoPilotRequestComponent)
      const navMeshComponent = getComponent(request.navEntity, NavMeshComponent)
      if (!navMeshComponent) {
        console.error('AutopilotSystem unable to process request - navigation entity does not have NavMeshComponent')
      }
      const { position } = getComponent(entity, TransformComponent)

      let autopilotComponent
      if (hasComponent(entity, AutoPilotComponent)) {
        // reuse component
        autopilotComponent = getComponent(entity, AutoPilotComponent)
      } else {
        const path = findPath(navMeshComponent.yukaNavMesh, position, request.point)
        autopilotComponent = addComponent(entity, AutoPilotComponent, { path, navEntity: request.navEntity })
      }

      // TODO: "mount" player? disable movement, etc.

      removeComponent(entity, AutoPilotRequestComponent)
    }

    const allOngoing = ongoingQuery(world)

    // ongoing
    if (allOngoing.length) {
      // update our entity transform from vehicle
      const stick = GamepadAxis.Left
      for (const entity of allOngoing) {
        const autopilot = getComponent(entity, AutoPilotComponent)
        const { position: avatarPosition } = getComponent(entity, TransformComponent)
        if (autopilot.path.current().distanceTo(avatarPosition as any) < 0.2) {
          if (autopilot.path.finished()) {
            // Path is finished!
            Engine.inputState.set(stick, {
              type: InputType.TWODIM,
              value: [0, 0, 0],
              lifecycleState: LifecycleValue.CHANGED
            })

            // Path is finished - remove component
            removeComponent(entity, AutoPilotComponent)
            continue
          }
          autopilot.path.advance()
        }

        const avatar = getComponent(entity, AvatarComponent)
        const avatarViewRotation = Math.atan2(avatar.viewVector.x, avatar.viewVector.z)

        const targetPosition = new Vector3(autopilot.path.current().x, 0, autopilot.path.current().z)
        const direction = targetPosition
          .sub(avatarPosition.clone().setY(0))
          .applyAxisAngle(new Vector3(0, -1, 0), avatarViewRotation)
          .normalize()
        // .multiplyScalar(0.6) // speed

        const stickPosition: NumericalType = [direction.z, direction.x, Math.atan2(direction.x, direction.z)]
        // If position not set, set it with lifecycle started
        if (!Engine.inputState.has(stick)) {
          Engine.inputState.set(stick, {
            type: InputType.TWODIM,
            value: stickPosition,
            lifecycleState: LifecycleValue.STARTED
          })
        } else {
          // If position set, check it's value
          const oldStickPosition = Engine.inputState.get(stick)
          // If it's not the same, set it and update the lifecycle value to changed
          if (JSON.stringify(oldStickPosition) !== JSON.stringify(stickPosition)) {
            // console.log('---changed');
            // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
            Engine.inputState.set(stick, {
              type: InputType.TWODIM,
              value: stickPosition,
              lifecycleState: LifecycleValue.CHANGED
            })
          }
        }
      }
    }
    return world
  })
}
