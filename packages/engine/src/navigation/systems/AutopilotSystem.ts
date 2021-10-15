import { Intersection, Quaternion, Raycaster, Vector3 } from 'three'
import { NavMesh, Path, Vector3 as YukaVector3 } from 'yuka'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { GamepadAxis } from '../../input/enums/InputEnums'
import { InputType } from '../../input/enums/InputType'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AutoPilotClickRequestComponent } from '../component/AutoPilotClickRequestComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { NavMeshComponent } from '../component/NavMeshComponent'
import { AutoPilotOverrideComponent } from '../component/AutoPilotOverrideComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'

export const findPath = (navMesh: NavMesh, from: Vector3, to: Vector3, base: Vector3): Path => {
  // graph is in local coordinates, we need to convert "from" and "to" to local using "base" and center
  // TODO: handle scale and rotation of graph object, pass world matrix?
  const graphBaseCoordinate = new YukaVector3(base.x, base.y, base.z)
  const localFrom = new YukaVector3(from.x, from.y, from.z).sub(graphBaseCoordinate)
  const localTo = new YukaVector3(to.x, to.y, to.z).sub(graphBaseCoordinate)
  const points = navMesh.findPath(localFrom, localTo)

  const path = new Path()
  for (const point of points) {
    const worldPoint = point.clone().add(graphBaseCoordinate) // convert point back to world coordinates
    path.add(worldPoint)
  }
  return path
}

export default async function AutopilotSystem(world: World): Promise<System> {
  const GAMEPAD_STICK = GamepadAxis.Left
  const raycaster = new Raycaster()
  const quat = new Quaternion()
  const forward = new Vector3(0, 0, 1)
  const targetFlatPosition = new Vector3()
  const avatarPositionFlat = new Vector3()
  const direction = new Vector3()
  const stickValue = new Vector3()
  const startPoint = new YukaVector3()
  const endPoint = new YukaVector3()
  const path = new Path()

  const navmeshesQuery = defineQuery([NavMeshComponent])
  const requestsQuery = defineQuery([AutoPilotRequestComponent])
  const ongoingQuery = defineQuery([AutoPilotComponent])
  const navClickQuery = defineQuery([LocalInputTagComponent, AutoPilotClickRequestComponent])

  const vec3 = new Vector3()
  function getCameraDirection() {
    Engine.camera.getWorldDirection(vec3)

    vec3.setY(0).normalize()
    quat.setFromUnitVectors(forward, vec3)
    return quat
  }

  return () => {
    for (const entity of navClickQuery.enter()) {
      const { coords } = getComponent(entity, AutoPilotClickRequestComponent)
      const overrideComponent = getComponent(entity, AutoPilotOverrideComponent)
      raycaster.setFromCamera(coords, Engine.camera)

      const raycasterResults: Intersection[] = []

      const clickResult = navmeshesQuery().reduce(
        (previousEntry, currentEntity) => {
          const mesh = getComponent(currentEntity, NavMeshComponent).navTarget
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

      if (clickResult.point) {
        if (overrideComponent?.overrideCoords) clickResult.point = overrideComponent.overridePosition

        addComponent(entity, AutoPilotRequestComponent, {
          point: clickResult.point,
          navEntity: clickResult.entity
        })
      }

      removeComponent(entity, AutoPilotClickRequestComponent)
      if (hasComponent(entity, AutoPilotOverrideComponent)) removeComponent(entity, AutoPilotOverrideComponent)
    }

    // requests
    // generate path from target.graph and create new AutoPilotComponent (or reuse existing)
    for (const entity of requestsQuery.enter()) {
      const request = getComponent(entity, AutoPilotRequestComponent)
      const navMeshComponent = getComponent(request.navEntity, NavMeshComponent)
      const { position } = getComponent(entity, TransformComponent)
      if (!navMeshComponent.yukaNavMesh) {
        startPoint.copy(position as any)
        endPoint.copy(request.point as any)
        path.clear()
        path.add(startPoint)
        path.add(endPoint)
        addComponent(entity, AutoPilotComponent, {
          path,
          navEntity: request.navEntity
        })
      } else {
        const { position: navBaseCoordinate } = getComponent(request.navEntity, TransformComponent)

        addComponent(entity, AutoPilotComponent, {
          path: findPath(navMeshComponent.yukaNavMesh, position, request.point, navBaseCoordinate),
          navEntity: request.navEntity
        })
      }

      // TODO: "mount" player? disable movement, etc.

      removeComponent(entity, AutoPilotRequestComponent)
    }

    const allOngoing = ongoingQuery(world)

    // ongoing
    if (allOngoing.length) {
      // update our entity transform from vehicle
      const ARRIVING_DISTANCE = 1
      const ARRIVED_DISTANCE = 0.1
      const MIN_SPEED = 0.2
      const MAX_SPEED = 2
      for (const entity of allOngoing) {
        const autopilot = getComponent(entity, AutoPilotComponent)
        if (!autopilot.path.current()) {
          console.error('autopilot.path is invalid or empty')
          removeComponent(entity, AutoPilotComponent)
          continue
        }

        const { position: avatarPosition, rotation: avatarRotation } = getComponent(entity, TransformComponent)
        targetFlatPosition.set(autopilot.path.current().x, 0, autopilot.path.current().z)
        avatarPositionFlat.copy(avatarPosition).setY(0)
        const targetFlatDistance = targetFlatPosition.distanceTo(avatarPositionFlat)
        if (targetFlatDistance < ARRIVED_DISTANCE) {
          if (autopilot.path.finished()) {
            // Path is finished!
            Engine.inputState.set(GAMEPAD_STICK, {
              type: InputType.TWODIM,
              value: [0, 0, 0],
              lifecycleState: LifecycleValue.Changed
            })

            // Path is finished - remove component
            removeComponent(entity, AutoPilotComponent)
            continue
          }

          autopilot.path.advance()
          continue
        }

        const speedModifier = Math.min(
          MAX_SPEED,
          Math.max(
            MIN_SPEED,
            targetFlatDistance < ARRIVING_DISTANCE ? (targetFlatDistance * MAX_SPEED) / ARRIVING_DISTANCE : MAX_SPEED
          )
        )
        direction.copy(targetFlatPosition).sub(avatarPositionFlat).normalize()
        const targetAngle = Math.atan2(direction.x, direction.z)
        stickValue
          .copy(direction)
          .multiplyScalar(speedModifier)
          // Avatar controller system assumes all movement is relative to camera, so cancel that out
          .applyQuaternion(getCameraDirection().invert())

        const stickPosition: NumericalType = [stickValue.z, stickValue.x, targetAngle]
        // If position not set, set it with lifecycle started
        Engine.inputState.set(GAMEPAD_STICK, {
          type: InputType.TWODIM,
          value: stickPosition,
          lifecycleState: Engine.inputState.has(GAMEPAD_STICK) ? LifecycleValue.Started : LifecycleValue.Changed
        })

        avatarRotation.copy(quat.setFromUnitVectors(forward, direction))
      }
    }

    if (ongoingQuery.exit(world).length) {
      // send one relaxed gamepad state to stop movement
      Engine.inputState.set(GAMEPAD_STICK, {
        type: InputType.TWODIM,
        value: [0, 0],
        lifecycleState: LifecycleValue.Changed
      })
    }
  }
}
