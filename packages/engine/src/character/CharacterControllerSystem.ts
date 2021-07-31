import { Quaternion, Vector3 } from 'three'
import { Controller, ControllerHitEvent, PhysXInstance, RaycastQuery, SceneQueryType } from 'three-physx'
import { isClient } from '../common/functions/isClient'
import { System } from '../ecs/classes/System'
import { Not } from '../ecs/functions/ComponentFunctions'
import { getMutableComponent, getComponent, getRemovedComponent, hasComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../input/components/LocalInputReceiver'
import { characterMoveBehavior } from './behaviors/characterMoveBehavior'
import { ControllerColliderComponent } from './components/ControllerColliderComponent'
import { InterpolationComponent } from '../physics/components/InterpolationComponent'
import { CollisionGroups, DefaultCollisionMask } from '../physics/enums/CollisionGroups'
import { PhysicsSystem } from '../physics/systems/PhysicsSystem'
import { TransformComponent } from '../transform/components/TransformComponent'
import { CharacterComponent } from './components/CharacterComponent'
import { Engine } from '../ecs/classes/Engine'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { Network } from '../networking/classes/Network'
import { detectUserInPortal } from './functions/detectUserInPortal'
import { ServerSpawnSystem } from '../scene/systems/ServerSpawnSystem'
import { sendClientObjectUpdate } from '../networking/functions/sendClientObjectUpdate'
import { NetworkObjectUpdateType } from '../networking/templates/NetworkObjectUpdateSchema'
import { updatePlayerRotationFromViewVector } from './functions/updatePlayerRotationFromViewVector'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'

const vector3 = new Vector3()
const quat = new Quaternion()
const quat2 = new Quaternion()
const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

export class CharacterControllerSystem extends System {
  execute(delta: number): void {
    for (const entity of this.queryResults.controller.added) {
      const playerCollider = getMutableComponent(entity, ControllerColliderComponent)
      const actor = getMutableComponent(entity, CharacterComponent)
      const transform = getComponent(entity, TransformComponent)

      playerCollider.controller = PhysXInstance.instance.createController(
        new Controller({
          isCapsule: true,
          collisionLayer: CollisionGroups.Characters,
          collisionMask: DefaultCollisionMask,
          height: playerCollider.capsuleHeight,
          contactOffset: playerCollider.contactOffset,
          stepOffset: 0.25,
          slopeLimit: 0,
          radius: playerCollider.capsuleRadius,
          position: {
            x: transform.position.x,
            y: transform.position.y + actor.actorHalfHeight,
            z: transform.position.z
          },
          material: {
            dynamicFriction: playerCollider.friction
          }
        })
      )

      playerCollider.raycastQuery = PhysXInstance.instance.addRaycastQuery(
        new RaycastQuery({
          type: SceneQueryType.Closest,
          origin: new Vector3(0, actor.actorHalfHeight, 0),
          direction: new Vector3(0, -1, 0),
          maxDistance: actor.actorHalfHeight + 0.05,
          collisionMask: DefaultCollisionMask | CollisionGroups.Portal
        })
      )
    }

    for (const entity of this.queryResults.controller.removed) {
      const collider = getRemovedComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
      if (collider) {
        PhysXInstance.instance.removeController(collider.controller)
        PhysXInstance.instance.removeRaycastQuery(collider.raycastQuery)
      }

      const actor = getMutableComponent(entity, CharacterComponent)
      if (actor) {
        actor.isGrounded = false
      }
    }

    for (const entity of this.queryResults.controller.all) {
      const controller = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)

      // iterate on all collisions since the last update
      controller.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => {})

      if (!isClient || (entity && entity === Network.instance.localClientEntity)) detectUserInPortal(controller)

      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent)

      if (!actor.movementEnabled) return

      const transform = getComponent<TransformComponent>(entity, TransformComponent as any)

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
        const { position, rotation } = ServerSpawnSystem.instance.getRandomSpawnPoint()
        const pos = position.clone()
        pos.y += actor.actorHalfHeight
        console.log('player has fallen through the floor, teleporting them to', position)
        controller.controller.updateTransform({
          translation: pos,
          rotation
        })
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ForceTransformUpdate, [
          position.x,
          position.y,
          position.z,
          rotation.x,
          rotation.y,
          rotation.z,
          rotation.w
        ])
      }

      transform.position.set(
        controller.controller.transform.translation.x,
        controller.controller.transform.translation.y - actor.actorHalfHeight,
        controller.controller.transform.translation.z
      )

      controller.raycastQuery.origin.copy(transform.position).y += actor.actorHalfHeight
      controller.closestHit = controller.raycastQuery.hits[0]
      actor.isGrounded = controller.raycastQuery.hits.length > 0 || controller.controller.collisions.down
    }

    for (const entity of this.queryResults.localCharacter.all) {
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent)

      characterMoveBehavior(entity, delta)

      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      if (xrInputSourceComponent) {
        actor.viewVector.set(0, 0, 1).applyQuaternion(transform.rotation)
      }
    }

    for (const entity of this.queryResults.characterOnServer.all) {
      updatePlayerRotationFromViewVector(entity)
      characterMoveBehavior(entity, delta)
    }

    for (const entity of this.queryResults.xrInput.added) {
      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent)
      const actor = getMutableComponent(entity, CharacterComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)

      xrInputSourceComponent.controllerGroup.add(
        xrInputSourceComponent.controllerLeft,
        xrInputSourceComponent.controllerGripLeft,
        xrInputSourceComponent.controllerRight,
        xrInputSourceComponent.controllerGripRight
      )

      xrInputSourceComponent.controllerGroup.applyQuaternion(rotate180onY)
      object3DComponent.value.add(xrInputSourceComponent.controllerGroup, xrInputSourceComponent.head)

      if (isEntityLocalClient(entity)) {
        // TODO: Temporarily make rig invisible until rig is fixed
        actor?.modelContainer?.traverse((child) => {
          if (child.visible) {
            child.visible = false
          }
        })
      }
    }

    for (const entity of this.queryResults.xrInput.all) {
      if (!isEntityLocalClient(entity)) return
      const xrInputSourceComponent = getMutableComponent(entity, XRInputSourceComponent)
      const transform = getComponent<TransformComponent>(entity, TransformComponent)

      quat.copy(transform.rotation).invert()
      quat2.copy(Engine.camera.quaternion).premultiply(quat)
      xrInputSourceComponent.head.quaternion.copy(quat2)

      vector3.subVectors(Engine.camera.position, transform.position)
      vector3.applyQuaternion(quat)
      xrInputSourceComponent.head.position.copy(vector3)
    }

    for (const entity of this.queryResults.xrInput.removed) {
      const actor = getMutableComponent(entity, CharacterComponent)

      if (isEntityLocalClient(entity))
        // TODO: Temporarily make rig invisible until rig is fixed
        actor?.modelContainer?.traverse((child) => {
          if (child.visible) {
            child.visible = true
          }
        })
    }
  }
}

CharacterControllerSystem.queries = {
  localCharacter: {
    components: [LocalInputReceiver, ControllerColliderComponent, CharacterComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  character: {
    components: [CharacterComponent],
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
  characterOnServer: {
    components: [Not(LocalInputReceiver), Not(InterpolationComponent), CharacterComponent, ControllerColliderComponent],
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
