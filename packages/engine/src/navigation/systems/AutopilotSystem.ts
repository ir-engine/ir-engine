import { System } from '../../ecs/classes/System'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { EntityManager, NavMesh, Vector3 as YukaVector3, Path } from 'yuka'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NavMeshComponent } from '../component/NavMeshComponent'
import { Raycaster, Vector3 } from 'three'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { Engine } from '../../ecs/classes/Engine'
import { InputType } from '../../input/enums/InputType'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { GamepadAxis } from '../../input/enums/InputEnums'
import { NumericalType } from '../../common/types/NumericalTypes'
import { CharacterComponent } from '../../character/components/CharacterComponent'
import { AutoPilotClickRequestComponent } from '../component/AutoPilotClickRequestComponent'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { updatePlayerRotationFromViewVector } from '../../character/functions/updatePlayerRotationFromViewVector'

const findPath = (navMesh: NavMesh, from: Vector3, to: Vector3): Path => {
  const points = navMesh.findPath(new YukaVector3(from.x, from.y, from.z), new YukaVector3(to.x, to.y, to.z))

  const path = new Path()
  for (const point of points) {
    path.add(point)
  }
  return path
}

export class AutopilotSystem extends System {
  raycaster = new Raycaster()

  execute(delta: number, time: number): void {
    for (const entity of this.queryResults.navClick.added) {
      const { coords } = getComponent(entity, AutoPilotClickRequestComponent)
      // console.log('~~~ coords', coords)
      this.raycaster.setFromCamera(coords, Engine.camera)

      const raycasterResults = []
      const clickResult = this.queryResults.navmeshes?.all?.reduce(
        (previousEntry, currentEntity) => {
          const mesh = getComponent(currentEntity, Object3DComponent).value
          raycasterResults.length = 0
          this.raycaster.intersectObject(mesh, true, raycasterResults)
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
    for (const entity of this.queryResults.requests.added) {
      const request = getComponent(entity, AutoPilotRequestComponent)
      const navMeshComponent = getComponent(request.navEntity, NavMeshComponent)
      if (!navMeshComponent) {
        console.error('AutopilotSystem unable to process request - navigation entity does not have NavMeshComponent')
      }

      let autopilotComponent: AutoPilotComponent
      if (hasComponent(entity, AutoPilotComponent)) {
        // reuse component
        autopilotComponent = getMutableComponent(entity, AutoPilotComponent)
      } else {
        autopilotComponent = addComponent(entity, AutoPilotComponent)
      }
      autopilotComponent.navEntity = request.navEntity

      const { position } = getComponent(entity, TransformComponent)
      autopilotComponent.path = findPath(navMeshComponent.yukaNavMesh, position, request.point)
      console.log('autopilotComponent.path', autopilotComponent.path)

      // TODO: "mount" player? disable movement, etc.

      removeComponent(entity, AutoPilotRequestComponent)
    }

    // ongoing
    if (this.queryResults.ongoing.all.length) {
      // update our entity transform from vehicle
      const ROTATION_SPEED = 0.1 // angle per step in radians
      const ARRIVING_DISTANCE = 1
      const ARRIVED_DISTANCE = 0.1
      const MIN_SPEED = 0.2
      const stick = GamepadAxis.Left
      this.queryResults.ongoing.all.forEach((entity) => {
        const autopilot = getComponent(entity, AutoPilotComponent)
        const { position: actorPosition } = getComponent(entity, TransformComponent)
        const targetFlatPosition = new Vector3(autopilot.path.current().x, 0, autopilot.path.current().z)
        const targetFlatDistance = targetFlatPosition.distanceTo(actorPosition.clone().setY(0))
        if (targetFlatDistance < ARRIVED_DISTANCE) {
          if (autopilot.path.finished()) {
            // Path is finished!
            Engine.inputState.set(stick, {
              type: InputType.TWODIM,
              value: [0, 0, 0],
              lifecycleState: LifecycleValue.CHANGED
            })

            // Path is finished - remove component
            removeComponent(entity, AutoPilotComponent)
            return
          }
          autopilot.path.advance()
          return
        }

        const actor = getComponent(entity, CharacterComponent)
        const actorViewRotation = Math.atan2(actor.viewVector.x, actor.viewVector.z)
        const speedModifier = Math.min(
          1,
          Math.max(MIN_SPEED, targetFlatDistance < ARRIVING_DISTANCE ? targetFlatDistance / ARRIVING_DISTANCE : 1)
        )
        const direction = targetFlatPosition
          .clone()
          .sub(actorPosition.clone().setY(0))
          .applyAxisAngle(new Vector3(0, -1, 0), actorViewRotation)
          .normalize()
        const targetAngle = Math.atan2(direction.x, direction.z)
        const stickValue = direction.clone().multiplyScalar(speedModifier) // speed

        const stickPosition: NumericalType = [stickValue.z, stickValue.x, targetAngle]
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

        // rotation
        const targetDirection = targetFlatPosition.clone().sub(actorPosition).setY(0).normalize()
        // {
        //   // way 1
        //   const transform = getComponent(entity, TransformComponent)
        //   const forwardVector = new Vector3(0, 0, 1)
        //   applyVectorMatrixXZ(targetDirection, forwardVector)
        //   const targetQuaternion = new Quaternion().setFromUnitVectors(forwardVector, targetDirection)
        //   transform.rotation.rotateTowards(targetQuaternion, ROTATION_SPEED)
        //   // actor.viewVector.copy(targetDirection)
        //   actor.viewVector.copy(forwardVector).applyQuaternion(transform.rotation)
        // }
        {
          // way 2
          updatePlayerRotationFromViewVector(entity, targetDirection)
        }
      })
    }
  }

  static queries: any = {
    navmeshes: {
      components: [NavMeshComponent, Object3DComponent]
    },
    requests: {
      components: [AutoPilotRequestComponent],
      listen: {
        added: true
      }
    },
    ongoing: {
      components: [AutoPilotComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    navClick: {
      components: [LocalInputReceiver, AutoPilotClickRequestComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
