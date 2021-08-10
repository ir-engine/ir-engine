import { Group, MathUtils, Mesh, MeshPhongMaterial, Quaternion, Vector3 } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import {
  addComponent,
  createEntity,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractiveFocusedComponent } from '../components/InteractiveFocusedComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { SubFocusedComponent } from '../components/SubFocusedComponent'
import { FontManager } from '../../xrui/classes/FontManager'
import { hideInteractText, showInteractText } from '../functions/interactText'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'
import { InteractedComponent } from '../components/InteractedComponent'
import AudioSource from '../../scene/classes/AudioSource'
import { Engine } from '../../ecs/classes/Engine'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { createBoxComponent } from '../functions/createBoxComponent'
import { defineQuery, defineSystem, enterQuery, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'

const upVec = new Vector3(0, 1, 0)

export const InteractiveSystem = async (): Promise<System> => {
  const interactorsQuery = defineQuery([InteractorComponent])

  const interactiveQuery = defineQuery([InteractableComponent])
  const interactiveAddQuery = enterQuery(interactiveQuery)

  const boundingBoxQuery = defineQuery([BoundingBoxComponent])

  const focusQuery = defineQuery([InteractableComponent, InteractiveFocusedComponent])
  const focusAddQuery = enterQuery(focusQuery)
  const focusRemoveQuery = enterQuery(focusQuery)

  const subfocusQuery = defineQuery([InteractableComponent, SubFocusedComponent])
  const subfocusAddQuery = enterQuery(subfocusQuery)
  const subfocusRemoveQuery = enterQuery(subfocusQuery)

  const localUserQuery = defineQuery([LocalInputReceiverComponent, AvatarComponent])
  const interactedQuery = defineQuery([InteractedComponent])
  const interactedAddQuery = enterQuery(interactedQuery)

  const geometry = FontManager.instance.create3dText('INTERACT', new Vector3(0.8, 1, 0.2))

  const textSize = 0.1
  const text = new Mesh(geometry, new MeshPhongMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 1 }))
  text.scale.setScalar(textSize)

  const interactTextEntity = createEntity()
  const textGroup = new Group().add(text)
  addComponent(interactTextEntity, Object3DComponent, { value: textGroup })
  Engine.scene.add(textGroup)
  const transformComponent = addComponent(interactTextEntity, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
  transformComponent.scale.setScalar(0)
  textGroup.visible = false

  return defineSystem((world: ECSWorld) => {
    const { time } = world

    for (const entity of interactiveAddQuery(world)) {
      if (!hasComponent(entity, BoundingBoxComponent) && hasComponent(entity, Object3DComponent)) {
        createBoxComponent(entity)
      }
    }

    const interactives = interactiveQuery(world)

    for (const entity of interactorsQuery(world)) {
      if (interactives.length) {
        interactBoxRaycast(entity, boundingBoxQuery(world))
        const interacts = getComponent(entity, InteractorComponent)
        if (interacts.focusedInteractive) {
          if (!hasComponent(interacts.focusedInteractive, InteractiveFocusedComponent)) {
            addComponent(interacts.focusedInteractive, InteractiveFocusedComponent, { interacts: entity })
          }
        }

        // unmark all unfocused
        for (const entityInter of interactives) {
          if (entityInter !== interacts.focusedInteractive && hasComponent(entityInter, InteractiveFocusedComponent)) {
            removeComponent(entityInter, InteractiveFocusedComponent)
          }
          if (interacts.subFocusedArray.some((v) => v[0].entity === entityInter)) {
            if (!hasComponent(entityInter, SubFocusedComponent)) {
              addComponent(entityInter, SubFocusedComponent, { subInteracts: entityInter })
            }
          } else {
            removeComponent(entityInter, SubFocusedComponent)
          }
        }
      }
    }

    // removal is the first because the hint must first be deleted, and then a new one appears
    for (const entity of focusRemoveQuery(world)) {
      hideInteractText(interactTextEntity)
    }

    for (const entity of focusAddQuery(world)) {
      showInteractText(interactTextEntity, entity)
    }

    for (const entity of subfocusAddQuery(world)) {
      addComponent(entity, HighlightComponent, { color: 0xff0000, hiddenColor: 0x0000ff, edgeStrength: 1 })
    }
    for (const entity of subfocusRemoveQuery(world)) {
      removeComponent(entity, HighlightComponent)
    }

    for (const entity of interactedAddQuery(world)) {
      const interactiveComponent = getComponent(entity, InteractableComponent)
      if (hasComponent(entity, PositionalAudioComponent)) {
        const mediaObject = getComponent(entity, Object3DComponent).value as AudioSource
        mediaObject?.toggle()
      } else {
        EngineEvents.instance.dispatchEvent({
          type: EngineEvents.EVENTS.OBJECT_ACTIVATION,
          ...interactiveComponent.data
        })
      }
      removeComponent(entity, InteractedComponent)
    }

    for (const entity of localUserQuery(world)) {
      // animate the interact text up and down if it's visible
      const interactTextObject = getComponent(interactTextEntity, Object3DComponent).value
      if (!interactTextObject.visible) continue
      interactTextObject.children[0].position.y = Math.sin(time * 1.8) * 0.05
      if (Engine.activeCameraFollowTarget && hasComponent(Engine.activeCameraFollowTarget, FollowCameraComponent)) {
        interactTextObject.children[0].setRotationFromAxisAngle(
          upVec,
          MathUtils.degToRad(getComponent(Engine.activeCameraFollowTarget, FollowCameraComponent).theta)
        )
      } else {
        const { x, z } = getComponent(entity, TransformComponent).position
        interactTextObject.lookAt(x, interactTextObject.position.y, z)
      }
    }

    return world
  })
}
