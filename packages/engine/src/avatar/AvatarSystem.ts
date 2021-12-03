import { Camera, Group, Quaternion, Vector3 } from 'three'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../ecs/functions/ComponentFunctions'
import { RaycastComponent } from '../physics/components/RaycastComponent'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { World } from '../ecs/classes/World'
import { System } from '../ecs/classes/System'
import matches from 'ts-matches'
import { useWorld } from '../ecs/functions/SystemHooks'
import { teleportRigidbody } from '../physics/functions/teleportRigidbody'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { XRHandsInputComponent } from '../xr/components/XRHandsInputComponent'
import { useEngine } from '../ecs/classes/Engine'
import { initializeHandModel } from '../xr/functions/addControllerModels'
import { XRLGripButtonComponent, XRRGripButtonComponent } from '../xr/components/XRGripButtonComponent'
import { playTriggerPressAnimation, playTriggerReleaseAnimation } from '../xr/functions/controllerAnimation'
import { CameraIKComponent } from '../ikrig/components/CameraIKComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'

function avatarActionReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.setXRMode.matchesFromAny, (a) => {
      if (a.$from !== world.hostId && a.$from !== a.userId) return
      const entity = world.getUserAvatarEntity(a.userId)
      if (!entity) return

      if (a.enabled) {
        if (!hasComponent(entity, XRInputSourceComponent)) {
          addComponent(entity, XRInputSourceComponent, {
            controllerLeft: new Group(),
            controllerRight: new Group(),
            controllerGripLeft: new Group(),
            controllerGripRight: new Group(),
            container: new Group(),
            head: new Group()
          })
        }
      } else {
        if (hasComponent(entity, XRInputSourceComponent)) {
          removeComponent(entity, XRInputSourceComponent)
        }
      }
    })

    .when(NetworkWorldAction.xrHandsConnected.matchesFromAny, (a) => {
      if (a.userId === useEngine().userId) return
      const entity = world.getUserAvatarEntity(a.userId)
      if (!entity) return

      if (!hasComponent(entity, XRHandsInputComponent)) {
        addComponent(entity, XRHandsInputComponent, {
          hands: [new Group(), new Group()]
        })
      }

      const xrInputSource = getComponent(entity, XRHandsInputComponent)

      xrInputSource.hands.forEach((controller: any, i: number) => {
        initializeHandModel(controller, i === 0 ? 'left' : 'right')
      })
    })

    .when(NetworkWorldAction.teleportObject.matchesFromAny, (a) => {
      const [x, y, z, qX, qY, qZ, qW] = a.pose

      const entity = world.getNetworkObject(a.networkId)

      const colliderComponent = getComponent(entity, ColliderComponent)
      if (colliderComponent) {
        teleportRigidbody(colliderComponent.body, new Vector3(x, y, z), new Quaternion(qX, qY, qZ, qW))
        return
      }

      const controllerComponent = getComponent(entity, AvatarControllerComponent)
      if (controllerComponent) {
        const velocity = getComponent(entity, VelocityComponent)
        const avatar = getComponent(entity, AvatarComponent)
        controllerComponent.controller.setPosition({ x, y: y + avatar.avatarHalfHeight, z })
        velocity.velocity.setScalar(0)
      }
    })
}

export default async function AvatarSystem(world: World): Promise<System> {
  world.receptors.push(avatarActionReceptor)

  const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent])
  const xrHandsInputQuery = defineQuery([AvatarComponent, XRHandsInputComponent])
  const xrLGripQuery = defineQuery([AvatarComponent, XRLGripButtonComponent, XRInputSourceComponent])
  const xrRGripQuery = defineQuery([AvatarComponent, XRRGripButtonComponent, XRInputSourceComponent])

  return () => {
    for (const entity of xrInputQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)

      xrInputSourceComponent.container.add(
        xrInputSourceComponent.controllerLeft.parent || xrInputSourceComponent.controllerLeft,
        xrInputSourceComponent.controllerGripLeft.parent || xrInputSourceComponent.controllerGripLeft,
        xrInputSourceComponent.controllerRight.parent || xrInputSourceComponent.controllerRight,
        xrInputSourceComponent.controllerGripRight.parent || xrInputSourceComponent.controllerGripRight
      )

      xrInputSourceComponent.container.applyQuaternion(rotate180onY)
      object3DComponent.value.add(xrInputSourceComponent.container, xrInputSourceComponent.head)

      // Add head IK Solver
      if (!isEntityLocalClient(entity)) {
        addComponent(entity, CameraIKComponent, {
          boneIndex: 5, // Head bone
          camera: xrInputSourceComponent.head,
          rotationClamp: 0.785398
        })
      }
    }

    for (const entity of xrInputQuery.exit(world)) {
      const xrInputComponent = getComponent(entity, XRInputSourceComponent, true)
      xrInputComponent.container.removeFromParent()
      xrInputComponent.head.removeFromParent()
      removeComponent(entity, CameraIKComponent)
    }

    for (const entity of xrHandsInputQuery.enter(world)) {
      const xrHandsComponent = getComponent(entity, XRHandsInputComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)
      const container = new Group()
      container.add(...xrHandsComponent.hands)
      container.applyQuaternion(rotate180onY)
      object3DComponent.value.add(container)
    }

    for (const entity of raycastQuery(world)) {
      const raycastComponent = getComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const avatar = getComponent(entity, AvatarComponent)
      raycastComponent.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.hits.length > 0)
    }

    for (const entity of xrLGripQuery.enter()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent)
      playTriggerPressAnimation(inputComponent.controllerGripLeft)
    }

    for (const entity of xrRGripQuery.enter()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent)
      playTriggerPressAnimation(inputComponent.controllerGripRight)
    }

    for (const entity of xrLGripQuery.exit()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent, true)
      playTriggerReleaseAnimation(inputComponent.controllerGripLeft)
    }

    for (const entity of xrRGripQuery.exit()) {
      const inputComponent = getComponent(entity, XRInputSourceComponent, true)
      playTriggerReleaseAnimation(inputComponent.controllerGripRight)
    }
  }
}
