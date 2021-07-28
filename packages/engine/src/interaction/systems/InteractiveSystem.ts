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
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippedStateUpdateSchema } from '../enums/EquippedEnums'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { NetworkObjectUpdateType } from '../../networking/templates/NetworkObjectUpdateSchema'
import { sendClientObjectUpdate } from '../../networking/functions/sendClientObjectUpdate'
import { BodyType } from 'three-physx'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { getInteractiveIsInReachDistance } from '../../character/functions/getInteractiveIsInReachDistance'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { unequipEntity } from '../functions/equippableFunctions'
import { Network } from '../../networking/classes/Network'
import { FontManager } from '../../xrui/classes/FontManager'
import { hideInteractText, showInteractText } from '../functions/interactText'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraSystem } from '../../camera/systems/CameraSystem'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'
import { InteractedComponent } from '../components/InteractedComponent'
import MediaComponent from '../../scene/components/MediaComponent'
import AudioSource from '../../scene/classes/AudioSource'

const vector3 = new Vector3()

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

  const interactive = getComponent(entity, Interactable)

  const entityFocuser = focused ? getComponent(entity, InteractiveFocused).interacts : null
  // on interactive focused
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
      for (const entity of this.queryResults.interactors.all) {
        if (this.queryResults.interactive?.all.length) {
          interactBoxRaycast(entity, this.queryResults.boundingBox.all)
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
      }

      for (const entity of this.queryResults.boundingBox.added) {
        const calcBoundingBox = getMutableComponent(entity, BoundingBoxComponent)

        const object3D = getMutableComponent(entity, Object3DComponent).value
        const transform = getComponent(entity, TransformComponent)

        object3D.position.copy(transform.position)
        object3D.rotation.setFromQuaternion(transform.rotation)
        if (!calcBoundingBox.dynamic) object3D.updateMatrixWorld()

        let hasBoxExpanded = false

        // expand bounding box to
        object3D.traverse((obj3d: Mesh) => {
          if (obj3d instanceof Mesh) {
            if (!obj3d.geometry.boundingBox) obj3d.geometry.computeBoundingBox()
            const aabb = new Box3().copy(obj3d.geometry.boundingBox)
            if (!calcBoundingBox.dynamic) aabb.applyMatrix4(obj3d.matrixWorld)
            if (hasBoxExpanded) {
              calcBoundingBox.box.union(aabb)
            } else {
              calcBoundingBox.box = aabb
              hasBoxExpanded = true
            }
          }
        })
        // if no meshes, create a small bb so interactables still detect it
        if (!hasBoxExpanded) {
          calcBoundingBox.box = new Box3(
            new Vector3(-0.05, -0.05, -0.05).add(transform.position),
            new Vector3(0.05, 0.05, 0.05).add(transform.position)
          )
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

    for (const entity of this.queryResults.interacted.added) {
      const interactiveComponent = getComponent(entity, Interactable)
      if (hasComponent(entity, MediaComponent)) {
        const mediaObject = getComponent(entity, Object3DComponent).value as AudioSource
        mediaObject?.toggle()
      } else {
        EngineEvents.instance.dispatchEvent({
          type: InteractiveSystem.EVENTS.OBJECT_ACTIVATION,
          ...interactiveComponent.data
        })
      }
      removeComponent(entity, InteractedComponent)
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
    if (Network.instance.localClientEntity && hasComponent(this.interactTextEntity, Object3DComponent)) {
      const interactTextObject = getComponent(this.interactTextEntity, Object3DComponent).value
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
    },
    interacted: {
      components: [InteractedComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
