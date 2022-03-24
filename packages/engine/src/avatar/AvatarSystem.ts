import { Group, Object3D } from 'three'
import matches from 'ts-matches'

import { isClient } from '../common/functions/isClient'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../ecs/functions/ComponentFunctions'
import { useWorld } from '../ecs/functions/SystemHooks'
import { AvatarHandsIKComponent } from '../ik/components/AvatarHandsIKComponent'
import { HeadIKComponent } from '../ik/components/HeadIKComponent'
import { IKRigComponent } from '../ik/components/IKRigComponent'
import { isEntityLocalClient } from '../networking/functions/isEntityLocalClient'
import { NetworkWorldAction } from '../networking/functions/NetworkWorldAction'
import { RaycastComponent } from '../physics/components/RaycastComponent'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRLGripButtonComponent, XRRGripButtonComponent } from '../xr/components/XRGripButtonComponent'
import { XRHandsInputComponent } from '../xr/components/XRHandsInputComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { initializeHandModel, initializeXRInputs } from '../xr/functions/addControllerModels'
import { playTriggerPressAnimation, playTriggerReleaseAnimation } from '../xr/functions/controllerAnimation'
import { proxifyXRInputs } from '../xr/functions/WebXRFunctions'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'
import { detectUserInCollisions } from './functions/detectUserInCollisions'

function avatarActionReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.avatarDetails.matches, ({ $from, avatarDetail }) => {
      const client = world.clients.get($from)
      if (!client) throw Error(`Avatar details action received for a client that does not exist: ${$from}`)
      if (client.avatarDetail?.avatarURL === avatarDetail.avatarURL)
        return console.log('[AvatarSystem]: ignoring same avatar url')
      client.avatarDetail = avatarDetail
      if (isClient) {
        const entity = world.getUserAvatarEntity($from)
        loadAvatarForUser(entity, avatarDetail.avatarURL)
      }
    })

    .when(NetworkWorldAction.setXRMode.matches, (a) => {
      const entity = world.getUserAvatarEntity(a.$from)
      if (!entity) return

      if (a.enabled) {
        if (!hasComponent(entity, XRInputSourceComponent)) {
          const inputData = {
            controllerLeftParent: new Group(),
            controllerRightParent: new Group(),
            controllerGripLeftParent: new Group(),
            controllerGripRightParent: new Group(),

            controllerLeft: new Group(),
            controllerRight: new Group(),
            controllerGripLeft: new Group(),
            controllerGripRight: new Group(),
            container: new Group(),
            head: new Group()
          }

          inputData.controllerLeftParent.add(inputData.controllerLeft)
          inputData.controllerRightParent.add(inputData.controllerRight)
          inputData.controllerGripLeftParent.add(inputData.controllerGripLeft)
          inputData.controllerGripRightParent.add(inputData.controllerGripRight)

          addComponent(entity, XRInputSourceComponent, inputData as any)
        }
      } else if (hasComponent(entity, XRInputSourceComponent)) {
        removeComponent(entity, XRInputSourceComponent)
      }
    })

    .when(NetworkWorldAction.xrHandsConnected.matches, (a) => {
      if (a.$from === Engine.userId) return
      const entity = world.getUserAvatarEntity(a.$from)
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

    .when(NetworkWorldAction.teleportObject.matches, (a) => {
      const [x, y, z, qX, qY, qZ, qW] = a.pose
      const entity = world.getNetworkObject(a.object.ownerId, a.object.networkId)
      const controllerComponent = getComponent(entity, AvatarControllerComponent)
      if (controllerComponent) {
        const velocity = getComponent(entity, VelocityComponent)
        const avatar = getComponent(entity, AvatarComponent)
        controllerComponent.controller.setPosition({ x, y: y + avatar.avatarHalfHeight, z })
        velocity.linear.setScalar(0)
        velocity.angular.setScalar(0)
      }
    })
}

export default async function AvatarSystem(world: World) {
  world.receptors.push(avatarActionReceptor)

  const raycastQuery = defineQuery([AvatarComponent, RaycastComponent])
  const xrInputQuery = defineQuery([AvatarComponent, XRInputSourceComponent])
  const xrIKQuery = defineQuery([AvatarComponent, XRInputSourceComponent, IKRigComponent])
  const xrHandsInputQuery = defineQuery([AvatarComponent, XRHandsInputComponent, XRInputSourceComponent])
  const xrLGripQuery = defineQuery([AvatarComponent, XRLGripButtonComponent, XRInputSourceComponent])
  const xrRGripQuery = defineQuery([AvatarComponent, XRRGripButtonComponent, XRInputSourceComponent])

  return () => {
    for (const entity of xrInputQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      if (isClient) initializeXRInputs(entity)

      xrInputSourceComponent.container.add(
        xrInputSourceComponent.controllerLeftParent,
        xrInputSourceComponent.controllerGripLeftParent,
        xrInputSourceComponent.controllerRightParent,
        xrInputSourceComponent.controllerGripRightParent
      )

      Engine.scene.add(xrInputSourceComponent.container, xrInputSourceComponent.head)

      // Add head IK Solver
      if (!isEntityLocalClient(entity)) {
        proxifyXRInputs(entity, xrInputSourceComponent)
        addComponent(entity, HeadIKComponent, {
          boneName: 'Head',
          camera: xrInputSourceComponent.head,
          rotationClamp: 0.785398
        })
      }
    }

    for (const entity of xrInputQuery.exit(world)) {
      const xrInputComponent = getComponent(entity, XRInputSourceComponent, true)
      xrInputComponent.container.removeFromParent()
      xrInputComponent.head.removeFromParent()
      removeComponent(entity, HeadIKComponent)
    }

    for (const entity of xrIKQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const leftHint = new Object3D()
      const rightHint = new Object3D()
      leftHint.position.set(-0.5, 0.5, 0.5)
      rightHint.position.set(0.5, 0.5, 0.5)
      xrInputSourceComponent.controllerGripLeftParent.add(leftHint)
      xrInputSourceComponent.controllerGripRightParent.add(rightHint)

      addComponent(entity, AvatarHandsIKComponent, {
        leftTarget: xrInputSourceComponent.controllerGripLeftParent,
        leftHint: leftHint,
        leftTargetOffset: new Object3D(),
        leftTargetPosWeight: 1,
        leftTargetRotWeight: 0,
        leftHintWeight: 1,

        rightTarget: xrInputSourceComponent.controllerGripRightParent,
        rightHint: rightHint,
        rightTargetOffset: new Object3D(),
        rightTargetPosWeight: 1,
        rightTargetRotWeight: 0,
        rightHintWeight: 1
      })
    }

    for (const entity of xrIKQuery.exit(world)) {
      const ik = getComponent(entity, AvatarHandsIKComponent)
      ik.leftHint?.removeFromParent()
      ik.rightHint?.removeFromParent()
      removeComponent(entity, AvatarHandsIKComponent)
    }

    for (const entity of xrHandsInputQuery.enter(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const xrHandsComponent = getComponent(entity, XRHandsInputComponent)
      const container = xrInputSourceComponent.container
      container.add(...xrHandsComponent.hands)
    }

    for (const entity of raycastQuery(world)) {
      const raycastComponent = getComponent(entity, RaycastComponent)
      const transform = getComponent(entity, TransformComponent)
      const avatar = getComponent(entity, AvatarComponent)
      raycastComponent.origin.copy(transform.position).y += avatar.avatarHalfHeight
      avatar.isGrounded = Boolean(raycastComponent.hits.length > 0)
      detectUserInCollisions(entity)
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
