import { Quaternion, Vector3 } from 'three'
import { ControllerHitEvent, PhysXInstance } from 'three-physx'
import { isClient } from '../common/functions/isClient'
import { System } from '../ecs/classes/System'
import { Not } from '../ecs/functions/ComponentFunctions'
import { getMutableComponent, getComponent, getRemovedComponent, hasComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../input/components/LocalInputReceiver'
import { avatarMoveBehavior } from './behaviors/avatarMoveBehavior'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { InterpolationComponent } from '../physics/components/InterpolationComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { Engine } from '../ecs/classes/Engine'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { detectUserInPortal } from './functions/detectUserInPortal'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { RaycastComponent } from '../physics/components/RaycastComponent'
import { sendClientObjectUpdate } from '../networking/functions/sendClientObjectUpdate'
import { teleportPlayer } from './functions/teleportPlayer'
import { NetworkObjectUpdateType } from '../networking/templates/NetworkObjectUpdates'
import { SpawnPoints } from './ServerAvatarSpawnSystem'

const vector3 = new Vector3()
const quat = new Quaternion()
const quat2 = new Quaternion()
const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

export class AvatarControllerSystem extends System {
  execute(delta: number): void {
    for (const entity of this.queryResults.controller.removed) {
      const controller = getRemovedComponent(entity, AvatarControllerComponent)

      PhysXInstance.instance.removeController(controller.controller)

      const avatar = getMutableComponent(entity, AvatarComponent)
      if (avatar) {
        avatar.isGrounded = false
      }
    }

    for (const entity of this.queryResults.controller.all) {
      const controller = getMutableComponent(entity, AvatarControllerComponent)
      const raycastComponent = getMutableComponent(entity, RaycastComponent)

      // iterate on all collisions since the last update
      controller.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => {})

      detectUserInPortal(entity)

      const avatar = getMutableComponent(entity, AvatarComponent)
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
        const { position, rotation } = SpawnPoints.instance.getRandomSpawnPoint()

        teleportPlayer(entity, position, rotation)

        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ForceTransformUpdate, [
          position.x,
          position.y,
          position.z,
          rotation.x,
          rotation.y,
          rotation.z,
          rotation.w
        ])
        continue
      }

      transform.position.set(
        controller.controller.transform.translation.x,
        controller.controller.transform.translation.y - avatar.avatarHalfHeight,
        controller.controller.transform.translation.z
      )

      avatar.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0) // || controller.controller.collisions.down)

      avatarMoveBehavior(entity, delta)
    }

    for (const entity of this.queryResults.raycast.all) {
      const raycastComponent = getMutableComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const avatar = getMutableComponent(entity, AvatarComponent)
      raycastComponent.raycastQuery.origin.copy(transform.position).y += avatar.avatarHalfHeight
      if (!hasComponent(entity, AvatarControllerComponent)) {
        avatar.isGrounded = Boolean(raycastComponent.raycastQuery.hits.length > 0)
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
      const avatar = getMutableComponent(entity, AvatarComponent)

      // TODO: Temporarily make rig invisible until rig is fixed
      avatar.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = false
        }
      })
    }

    for (const entity of this.queryResults.localXRInput.removed) {
      const avatar = getMutableComponent(entity, AvatarComponent)
      // TODO: Temporarily make rig invisible until rig is fixed
      avatar?.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = true
        }
      })
    }

    for (const entity of this.queryResults.localXRInput.all) {
      const avatar = getMutableComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)
      avatar.viewVector.set(0, 0, 1).applyQuaternion(transform.rotation)

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

AvatarControllerSystem.queries = {
  characterOnServer: {
    components: [Not(LocalInputReceiver), Not(InterpolationComponent), AvatarComponent, AvatarControllerComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  controller: {
    components: [AvatarControllerComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  raycast: {
    components: [AvatarComponent, RaycastComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  localXRInput: {
    components: [LocalInputReceiver, XRInputSourceComponent, AvatarControllerComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  xrInput: {
    components: [AvatarComponent, XRInputSourceComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
