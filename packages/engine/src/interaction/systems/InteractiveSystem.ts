import { Group, MathUtils, Mesh, MeshPhongMaterial, Vector3 } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { System } from '../../ecs/classes/System'
import {
  addComponent,
  createEntity,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBox'
import { Interactable } from '../components/Interactable'
import { InteractiveFocused } from '../components/InteractiveFocused'
import { Interactor } from '../components/Interactor'
import { SubFocused } from '../components/SubFocused'
import { FontManager } from '../../xrui/classes/FontManager'
import { hideInteractText, showInteractText } from '../functions/interactText'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'
import { InteractedComponent } from '../components/InteractedComponent'
import AudioSource from '../../scene/classes/AudioSource'
import { Engine } from '../../ecs/classes/Engine'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { createBoxComponent } from '../functions/createBoxComponent'

const upVec = new Vector3(0, 1, 0)

export class InteractiveSystem extends System {
  static EVENTS = {
    OBJECT_HOVER: 'INTERACTIVE_SYSTEM_OBJECT_HOVER',
    OBJECT_ACTIVATION: 'INTERACTIVE_SYSTEM_OBJECT_ACTIVATION'
  }

  interactTextEntity: Entity

  constructor() {
    super()
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
    Engine.scene.add(textGroup)
    const transformComponent = addComponent(this.interactTextEntity, TransformComponent)
    transformComponent.scale.setScalar(0)
    textGroup.visible = false
  }

  dispose(): void {
    super.dispose()
    this.reset()

    EngineEvents.instance.removeAllListenersForEvent(InteractiveSystem.EVENTS.OBJECT_ACTIVATION)
    EngineEvents.instance.removeAllListenersForEvent(InteractiveSystem.EVENTS.OBJECT_HOVER)
  }

  execute(delta: number, time: number): void {
    for (const entity of this.queryResults.interactive.added) {
      if (!hasComponent(entity, BoundingBoxComponent) && hasComponent(entity, Object3DComponent)) {
        createBoxComponent(entity)
      }
    }

    for (const entity of this.queryResults.interactors.all) {
      if (this.queryResults.interactive.all.length) {
        interactBoxRaycast(entity, this.queryResults.boundingBox.all)
        const interacts = getComponent(entity, Interactor)
        if (interacts.focusedInteractive) {
          if (!hasComponent(interacts.focusedInteractive, InteractiveFocused)) {
            addComponent(interacts.focusedInteractive, InteractiveFocused, { interacts: entity })
          }
        }

        // unmark all unfocused
        for (const entityInter of this.queryResults.interactive.all) {
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

    // removal is the first because the hint must first be deleted, and then a new one appears
    for (const entity of this.queryResults.focus.removed) {
      hideInteractText(this.interactTextEntity)
    }

    for (const entity of this.queryResults.focus.added) {
      showInteractText(this.interactTextEntity, entity)
    }

    for (const entity of this.queryResults.subfocus.added) {
      addComponent(entity, HighlightComponent, { color: 0xff0000, hiddenColor: 0x0000ff })
    }
    for (const entity of this.queryResults.subfocus.removed) {
      removeComponent(entity, HighlightComponent)
    }

    for (const entity of this.queryResults.interacted.added) {
      const interactiveComponent = getComponent(entity, Interactable)
      if (hasComponent(entity, PositionalAudioComponent)) {
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

    for (const entity of this.queryResults.local_user.all) {
      // animate the interact text up and down if it's visible
      const interactTextObject = getComponent(this.interactTextEntity, Object3DComponent).value
      if (!interactTextObject.visible) continue
      interactTextObject.children[0].position.y = Math.sin(time * 1.8) * 0.05
      const activeCameraComponent = getMutableComponent(Engine.activeCameraEntity, CameraComponent)
      if (
        activeCameraComponent.followTarget &&
        hasComponent(activeCameraComponent.followTarget, FollowCameraComponent)
      ) {
        interactTextObject.children[0].setRotationFromAxisAngle(
          upVec,
          MathUtils.degToRad(getComponent(activeCameraComponent.followTarget, FollowCameraComponent).theta)
        )
      } else {
        const { x, z } = getComponent(entity, TransformComponent).position
        interactTextObject.lookAt(x, interactTextObject.position.y, z)
      }
    }
  }

  static queries = {
    interactors: { components: [Interactor] },
    interactive: {
      components: [Interactable],
      listen: {
        added: true,
        removed: true
      }
    },
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
      components: [LocalInputReceiver, AvatarComponent],
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
