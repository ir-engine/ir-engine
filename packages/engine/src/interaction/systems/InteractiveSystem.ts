import {
  Box3,
  Frustum,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  Vector3
} from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { isClient } from '../../common/functions/isClient'
import { vectorToScreenXYZ } from '../../common/functions/vectorToScreenXYZ'
import { Behavior } from '../../common/interfaces/Behavior'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { System } from '../../ecs/classes/System'
import { Not } from '../../ecs/functions/ComponentFunctions'
import {
  addComponent,
  createEntity,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { RigidBodyComponent } from '../../physics/components/RigidBody'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { CharacterComponent } from '../../character/components/CharacterComponent'
import { VehicleComponent } from '../../vehicle/components/VehicleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBox'
import { Interactable } from '../components/Interactable'
import { InteractiveFocused } from '../components/InteractiveFocused'
import { Interactor } from '../components/Interactor'
import { SubFocused } from '../components/SubFocused'
import { InteractBehaviorArguments } from '../types/InteractionTypes'
import { HasHadInteraction } from '../../game/actions/HasHadInteraction'
import { addActionComponent } from '../../game/functions/functionsActions'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippedStateUpdateSchema } from '../enums/EquippedEnums'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { NetworkObjectUpdateType } from '../../networking/templates/NetworkObjectUpdateSchema'
import { sendClientObjectUpdate } from '../../networking/functions/sendClientObjectUpdate'
import { BodyType } from 'three-physx'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { ParityValue } from '../../common/enums/ParityValue'
import {
  getInteractiveIsInReachDistance,
  interactiveReachDistance
} from '../../character/functions/getInteractiveIsInReachDistance'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { unequipEntity } from '../functions/equippableFunctions'
import { Network } from '../../networking/classes/Network'
import { FontManager } from '../../xrui/classes/FontManager'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { Sphere } from 'three'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { Tween } from '@tweenjs/tween.js'
import { hideInteractText, showInteractText } from '../functions/interactText'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraSystem } from '../../camera/systems/CameraSystem'

const vector3 = new Vector3()
// but is works on client too, i will config out this
export const interactOnServer: Behavior = (entity: Entity, parityValue, delta): void => {
  //console.warn('Behavior: interact , networkId ='+getComponent(entity, NetworkObject).networkId);

  const equipperComponent = getComponent(entity, EquipperComponent)
  if (equipperComponent) {
    unequipEntity(entity)
    return
  }

  let focusedArrays = []
  for (let i = 0; i < Engine.entities.length; i++) {
    const isEntityInteractable = Engine.entities[i]
    if (hasComponent(isEntityInteractable, Interactable)) {
      const interactive = getComponent(isEntityInteractable, Interactable)
      const intPosition = getComponent(isEntityInteractable, TransformComponent).position
      const intRotation = getComponent(isEntityInteractable, TransformComponent).rotation
      const position = getComponent(entity, TransformComponent).position

      if (interactive.interactionPartsPosition.length > 0) {
        interactive.interactionPartsPosition.forEach((v, i) => {
          const partPosition = vector3.set(v[0], v[1], v[2]).applyQuaternion(intRotation).add(intPosition)
          if (getInteractiveIsInReachDistance(entity, intPosition, parityValue)) {
            focusedArrays.push([isEntityInteractable, position.distanceTo(partPosition), i])
          }
        })
      } else {
        if (getInteractiveIsInReachDistance(entity, intPosition, parityValue)) {
          if (typeof interactive.onInteractionCheck === 'function') {
            if (interactive.onInteractionCheck(entity, isEntityInteractable, null)) {
              focusedArrays.push([isEntityInteractable, position.distanceTo(intPosition), null])
            }
          } else {
            focusedArrays.push([isEntityInteractable, position.distanceTo(intPosition), null])
          }
        }
      }
    }
  }

  focusedArrays = focusedArrays.sort((a: any, b: any) => a[1] - b[1])
  if (focusedArrays.length < 1) return

  const interactable = getComponent(focusedArrays[0][0], Interactable)
  const interactionCheck = interactable.onInteractionCheck(entity, focusedArrays[0][0], focusedArrays[0][2])

  if (interactable.data.interactionType === 'gameobject') {
    addActionComponent(focusedArrays[0][0], HasHadInteraction, {
      args: { side: parityValue },
      entityNetworkId: getComponent(entity, NetworkObject).networkId
    })
    return
  }
  // Not Game Object
  if (interactionCheck) {
    //  console.warn('start with networkId: '+getComponent(focusedArrays[0][0], NetworkObject).networkId+' seat: '+focusedArrays[0][2]);
    interactable.onInteraction(
      entity,
      { side: parityValue, currentFocusedPart: focusedArrays[0][2] },
      delta,
      focusedArrays[0][0]
    )
  }
}

export const subFocused: Behavior = (entity: Entity, args, delta: number): void => {
  if (!hasComponent(entity, Interactable)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component')
    return
  }
  hasComponent(entity, SubFocused)
    ? addComponent(entity, HighlightComponent, { color: 0xff0000, hiddenColor: 0x0000ff })
    : removeComponent(entity, HighlightComponent)
}

const interactFocused: Behavior = (entity: Entity, args, delta: number): void => {
  if (!hasComponent(entity, Interactable)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component')
    return
  }

  const focused = hasComponent(entity, InteractiveFocused)
  const subFocused = hasComponent(entity, SubFocused)

  const interactive = getComponent(entity, Interactable)

  if (interactive && typeof interactive.onInteractionFocused === 'function') {
    const entityFocuser = focused ? getComponent(entity, InteractiveFocused).interacts : null
    interactive.onInteractionFocused(entityFocuser, { focused }, delta, entity)
  }
}

const mat4 = new Matrix4()
const projectionMatrix = new Matrix4().makePerspective(
  -0.1, // x1
  0.1, // x2
  -0.1, // y1
  0.1, // y2
  0.1, // near
  2 // far
)
const frustum = new Frustum()
const vec3 = new Vector3()

type RaycastResult = [Entity, boolean, number?, number?]

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */

const interactBoxRaycast: Behavior = (
  entity: Entity,
  { raycastList }: InteractBehaviorArguments,
  delta: number
): void => {
  const interacts = getMutableComponent(entity, Interactor)
  if (!isEntityLocalClient(entity)) {
    interacts.subFocusedArray = []
    interacts.focusedInteractive = null
    return
  }

  const transform = getComponent(entity, TransformComponent)
  const actor = getComponent(entity, CharacterComponent)

  if (!raycastList.length) {
    return
  }

  actor.frustumCamera.updateMatrixWorld()
  actor.frustumCamera.matrixWorldInverse.copy(actor.frustumCamera.matrixWorld).invert()

  mat4.multiplyMatrices(projectionMatrix, actor.frustumCamera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  const subFocusedArray = raycastList
    .map((entityIn): RaycastResult => {
      const boundingBox = getComponent(entityIn, BoundingBoxComponent)
      const interactive = getComponent(entityIn, Interactable)
      if (boundingBox.boxArray.length) {
        // TO DO: static group object

        if (boundingBox.dynamic) {
          const arr = boundingBox.boxArray
            .map((object3D, index): RaycastResult => {
              if (interactive.onInteractionCheck(entity, entityIn, index)) {
                const aabb = new Box3()
                aabb.setFromObject(object3D)
                return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position), index]
              }
              return [entityIn, false, null, index]
            })
            .filter((value) => value[1])
            .sort((a: any, b: any) => a[2] - b[2])

          if (arr.length) {
            return arr[0]
          } else {
            return [null, false]
          }
        }
      } else {
        if (boundingBox.dynamic) {
          const object3D = getComponent(entityIn, Object3DComponent)
          const aabb = new Box3()
          aabb.copy(boundingBox.box)
          aabb.applyMatrix4(object3D.value.matrixWorld)
          return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position)]
        } else {
          return [entityIn, frustum.intersectsBox(boundingBox.box), boundingBox.box.distanceToPoint(transform.position)]
        }
      }
    })
    .filter((value) => value[1])

  if (!subFocusedArray.length) {
    interacts.subFocusedArray = []
    interacts.focusedInteractive = null
    return
  }

  interacts.subFocusedArray = subFocusedArray.map((v: any) => [getComponent(v[0], Object3DComponent).value, v[3]])

  const [entityInteractable, doesIntersectFrustrum, distanceToPlayer] = subFocusedArray.sort(
    (a: any, b: any) => a[2] - b[2]
  )[0]

  const interactable = getComponent(entityInteractable, Interactable)
  const distance =
    typeof interactable.data.interactionDistance !== 'undefined'
      ? interactable.data.interactionDistance
      : interactiveReachDistance

  const resultIsCloseEnough = distanceToPlayer < distance
  if (resultIsCloseEnough) {
    interacts.focusedInteractive = entityInteractable
  }
}

const upVec = new Vector3(0, 1, 0)

export class InteractiveSystem extends System {
  static EVENTS = {
    OBJECT_HOVER: 'INTERACTIVE_SYSTEM_OBJECT_HOVER',
    OBJECT_ACTIVATION: 'INTERACTIVE_SYSTEM_OBJECT_ACTIVATION'
  }

  /**
   * Elements that was in focused state on last execution
   */
  focused: Set<Entity>
  /**
   * Elements that are focused on current execution
   */
  newFocused: Set<Entity>
  previousEntity: Entity
  previousEntity2DPosition: Vector3

  interactTextEntity: Entity

  constructor() {
    super()
    this.reset()
  }

  reset(): void {
    this.previousEntity = null
    this.previousEntity2DPosition = null
    this.focused = new Set<Entity>()
    this.newFocused = new Set<Entity>()
  }

  dispose(): void {
    super.dispose()
    this.reset()

    EngineEvents.instance.removeAllListenersForEvent(InteractiveSystem.EVENTS.OBJECT_ACTIVATION)
    EngineEvents.instance.removeAllListenersForEvent(InteractiveSystem.EVENTS.OBJECT_HOVER)
  }

  async initialize() {
    super.initialize()
    if (isClient) {
      const geometry = FontManager.instance.create3dText('INTERACT', new Vector3(0.8, 1, 0.2))

      const textSize = 0.1
      const text = new Mesh(
        geometry,
        new MeshPhongMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 1 })
      )
      text.scale.setScalar(textSize)

      this.interactTextEntity = createEntity()
      const textGroup = new Group().add(text)
      addComponent(this.interactTextEntity, Object3DComponent, { value: textGroup })
      const transformComponent = addComponent(this.interactTextEntity, TransformComponent)
      transformComponent.scale.setScalar(0)
      textGroup.visible = false
    }
  }

  execute(delta: number, time: number): void {
    this.newFocused.clear()
    if (isClient) {
      this.queryResults.interactors?.all.forEach((entity) => {
        if (this.queryResults.interactive?.all.length) {
          interactBoxRaycast(entity, { raycastList: this.queryResults.boundingBox.all })
          const interacts = getComponent(entity, Interactor)
          if (interacts.focusedInteractive) {
            this.newFocused.add(interacts.focusedInteractive)
            // TODO: can someone else focus object? should we update 'interacts' entity
            if (!hasComponent(interacts.focusedInteractive, InteractiveFocused)) {
              addComponent(interacts.focusedInteractive, InteractiveFocused, { interacts: entity })
            }
          }

          // unmark all unfocused
          for (const entityInter of this.queryResults.interactive.all) {
            if (
              !hasComponent(entityInter, BoundingBoxComponent) &&
              hasComponent(entityInter, Object3DComponent) &&
              hasComponent(entityInter, TransformComponent)
            ) {
              addComponent(entityInter, BoundingBoxComponent, {
                dynamic: hasComponent(entityInter, RigidBodyComponent) || hasComponent(entityInter, VehicleComponent)
              })
            }
            if (entityInter !== interacts.focusedInteractive && hasComponent(entityInter, InteractiveFocused)) {
              removeComponent(entityInter, InteractiveFocused)
            }
            if (interacts.subFocusedArray.some((v) => v[0].entity === entityInter)) {
              if (!hasComponent(entityInter, SubFocused)) {
                addComponent(entityInter, SubFocused)
              }
            } else {
              removeComponent(entityInter, SubFocused)
            }
          }
        }
      })

      for (const entity of this.queryResults.boundingBox.added) {
        const interactive = getMutableComponent(entity, Interactable)
        const calcBoundingBox = getMutableComponent(entity, BoundingBoxComponent)

        const object3D = getMutableComponent(entity, Object3DComponent).value
        const transform = getComponent(entity, TransformComponent)

        object3D.position.copy(transform.position)
        object3D.rotation.setFromQuaternion(transform.rotation)
        if (!calcBoundingBox.dynamic) object3D.updateMatrixWorld()

        if (interactive.interactionParts.length) {
          const arr = interactive.interactionParts.map((name) => object3D.children[0].getObjectByName(name))
          calcBoundingBox.boxArray = arr
        } else {
          object3D.traverse((obj3d: Mesh) => {
            if (obj3d instanceof Mesh) {
              if (!obj3d.geometry.boundingBox) obj3d.geometry.computeBoundingBox()
              const aabb = new Box3().copy(obj3d.geometry.boundingBox)
              if (!calcBoundingBox.dynamic) aabb.applyMatrix4(obj3d.matrixWorld)
              if (!calcBoundingBox.box) {
                calcBoundingBox.box = aabb
              } else {
                calcBoundingBox.box.union(aabb)
              }
            }
          })
        }
      }

      // removal is the first because the hint must first be deleted, and then a new one appears
      for (const entity of this.queryResults.focus.removed) {
        interactFocused(entity, null, delta)
        hideInteractText(this.interactTextEntity)
      }

      for (const entity of this.queryResults.focus.added) {
        interactFocused(entity, null, delta)
        showInteractText(this.interactTextEntity, entity)
      }

      for (const entity of this.queryResults.subfocus.added) {
        subFocused(entity, null, delta)
      }
      for (const entity of this.queryResults.subfocus.removed) {
        subFocused(entity, null, delta)
      }

      this.focused.clear()
      this.newFocused.forEach((e) => this.focused.add(e))
    }

    for (const entity of this.queryResults.equippable.added) {
      const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
      // all equippables must have a collider to grab by in VR
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) collider.body.type = BodyType.KINEMATIC
      // send equip to clients
      if (!isClient) {
        const networkObject = getComponent(equippedEntity, NetworkObject)
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
          BinaryValue.TRUE,
          networkObject.networkId
        ] as EquippedStateUpdateSchema)
      }
    }

    for (const entity of this.queryResults.equippable.all) {
      const equipperComponent = getComponent(entity, EquipperComponent)
      const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
      const handTransform = getHandTransform(entity)
      const { position, rotation } = handTransform
      equippableTransform.position.copy(position)
      equippableTransform.rotation.copy(rotation)
      if (!isClient) {
        for (const userEntity of this.queryResults.network_user.added) {
          const networkObject = getComponent(equipperComponent.equippedEntity, NetworkObject)
          sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
            BinaryValue.TRUE,
            networkObject.networkId
          ] as EquippedStateUpdateSchema)
        }
      }
    }

    for (const entity of this.queryResults.equippable.removed) {
      const equipperComponent = getComponent(entity, EquipperComponent, true)
      const equippedEntity = equipperComponent.equippedEntity
      const equippedTransform = getComponent(equippedEntity, TransformComponent)
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) {
        collider.body.type = BodyType.DYNAMIC
        collider.body.updateTransform({
          translation: equippedTransform.position,
          rotation: equippedTransform.rotation
        })
      }
      // send unequip to clients
      if (!isClient) {
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
          BinaryValue.FALSE
        ] as EquippedStateUpdateSchema)
      }
    }

    // animate the interact text up and down if it's visible
    if (Network.instance.localClientEntity) {
      const interactTextObject = getComponent(this.interactTextEntity, Object3DComponent)?.value

      if (!interactTextObject) return

      interactTextObject.children[0].position.y = Math.sin(time * 1.8) * 0.05

      const activeCameraComponent = getMutableComponent(CameraSystem.instance.activeCamera, CameraComponent)
      if (
        activeCameraComponent.followTarget &&
        hasComponent(activeCameraComponent.followTarget, FollowCameraComponent)
      ) {
        interactTextObject.children[0].setRotationFromAxisAngle(
          upVec,
          MathUtils.degToRad(getComponent(activeCameraComponent.followTarget, FollowCameraComponent).theta)
        )
      } else {
        const { x, z } = getComponent(Network.instance.localClientEntity, TransformComponent).position
        interactTextObject.lookAt(x, interactTextObject.position.y, z)
      }
    }
  }

  static queries: any = {
    interactors: { components: [Interactor] },
    interactive: { components: [Interactable] },
    boundingBox: {
      components: [BoundingBoxComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    focus: {
      components: [Interactable, InteractiveFocused],
      listen: {
        added: true,
        removed: true
      }
    },
    subfocus: {
      components: [Interactable, SubFocused],
      listen: {
        added: true,
        removed: true
      }
    },
    local_user: {
      components: [LocalInputReceiver, CharacterComponent, TransformComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    network_user: {
      components: [Not(LocalInputReceiver), CharacterComponent, TransformComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    equippable: {
      components: [EquipperComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
