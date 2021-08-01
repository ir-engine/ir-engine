import { Quaternion, Vector3 } from 'three'
import { ControllerHitEvent, PhysXInstance } from 'three-physx'
import { isClient } from '../common/functions/isClient'
import { System } from '../ecs/classes/System'
import { Not } from '../ecs/functions/ComponentFunctions'
import {
  getMutableComponent,
  getComponent,
  getRemovedComponent,
  hasComponent,
  addComponent,
  removeComponent
} from '../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../input/components/LocalInputReceiver'
import { characterMoveBehavior } from './behaviors/characterMoveBehavior'
import { ControllerColliderComponent } from './components/ControllerColliderComponent'
import { InterpolationComponent } from '../physics/components/InterpolationComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { CharacterComponent } from './components/CharacterComponent'
import { Engine } from '../ecs/classes/Engine'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { Network } from '../networking/classes/Network'
import { detectUserInPortal } from './functions/detectUserInPortal'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'
import { RespawnTagComponent } from '../scene/components/RespawnTagComponent'
import { RaycastComponent } from '../physics/components/RaycastComponent'

const vector3 = new Vector3()
const quat = new Quaternion()
const quat2 = new Quaternion()
const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

export class CharacterControllerSystem extends System {
  execute(delta: number): void {
    for (const entity of this.queryResults.controller.removed) {
      const controller = getRemovedComponent(entity, ControllerColliderComponent)

      PhysXInstance.instance.removeController(controller.controller)

      const actor = getMutableComponent(entity, CharacterComponent)
      if (actor) {
        actor.isGrounded = false
      }
    }

    for (const entity of this.queryResults.controller.all) {
      const controller = getMutableComponent(entity, ControllerColliderComponent)
      const raycastComponent = getMutableComponent(entity, RaycastComponent)

      // iterate on all collisions since the last update
      controller.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => {})

      if (!isClient || (entity && entity === Network.instance.localClientEntity)) detectUserInPortal(entity)

      const actor = getMutableComponent(entity, CharacterComponent)

      if (!actor.movementEnabled) return

      const transform = getComponent(entity, TransformComponent)

      // reset if vals are invalid
      if (isNaN(controller.controller.transform.translation.x)) {
        console.warn('WARNING: Character physics data reporting NaN', controller.controller.transform.translation)
        controller.controller.updateTransform({
          translation: { x: 0, y: 10, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 }
        })
      }

      // TODO: implement scene lower bounds parameter
      if (!isClient && controller.controller.transform.translation.y < -10) {
        if (hasComponent(entity, RespawnTagComponent)) removeComponent(entity, RespawnTagComponent)
        addComponent(entity, RespawnTagComponent)
        continue
      }

      transform.position.set(
        controller.controller.transform.translation.x,
        controller.controller.transform.translation.y - actor.actorHalfHeight,
        controller.controller.transform.translation.z
      )

      actor.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0) // || controller.controller.collisions.down)

      characterMoveBehavior(entity, delta)
    }

    for (const entity of this.queryResults.raycast.all) {
      const raycastComponent = getMutableComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const actor = getMutableComponent(entity, CharacterComponent)
      raycastComponent.raycastQuery.origin.copy(transform.position).y += actor.actorHalfHeight
      if (!hasComponent(entity, ControllerColliderComponent)) {
        actor.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0)
      }
    }

    for (const entity of this.queryResults.xrInput.added) {
      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)

      xrInputSourceComponent.controllerGroup.add(
        xrInputSourceComponent.controllerLeft,
        xrInputSourceComponent.controllerGripLeft,
        xrInputSourceComponent.controllerRight,
        xrInputSourceComponent.controllerGripRight
      )

      xrInputSourceComponent.controllerGroup.applyQuaternion(rotate180onY)
      object3DComponent.value.add(xrInputSourceComponent.controllerGroup, xrInputSourceComponent.head)
    }

    for (const entity of this.queryResults.localXRInput.added) {
      const actor = getMutableComponent(entity, CharacterComponent)

      // TODO: Temporarily make rig invisible until rig is fixed
      actor.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = false
        }
      })
    }

    for (const entity of this.queryResults.localXRInput.removed) {
      const actor = getMutableComponent(entity, CharacterComponent)
      // TODO: Temporarily make rig invisible until rig is fixed
      actor?.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = true
        }
      })
    }

    for (const entity of this.queryResults.localXRInput.all) {
      const actor = getMutableComponent(entity, CharacterComponent)
      const transform = getComponent(entity, TransformComponent)
      actor.viewVector.set(0, 0, 1).applyQuaternion(transform.rotation)

      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent)

      quat.copy(transform.rotation).invert()
      quat2.copy(Engine.camera.quaternion).premultiply(quat)
      xrInputSourceComponent.head.quaternion.copy(quat2)

      vector3.subVectors(Engine.camera.position, transform.position)
      vector3.applyQuaternion(quat)
      xrInputSourceComponent.head.position.copy(vector3)
    }
  }
}

CharacterControllerSystem.queries = {
  characterOnServer: {
    components: [Not(LocalInputReceiver), Not(InterpolationComponent), CharacterComponent, ControllerColliderComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  controller: {
    components: [ControllerColliderComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  raycast: {
    components: [CharacterComponent, RaycastComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  localXRInput: {
    components: [LocalInputReceiver, XRInputSourceComponent, ControllerColliderComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  xrInput: {
    components: [CharacterComponent, XRInputSourceComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
