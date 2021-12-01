import { Easing, Tween } from '@tweenjs/tween.js'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  defineQuery
} from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { FontManager } from '../../xrui/classes/FontManager'
import { Group, MathUtils, Mesh, MeshPhongMaterial, Quaternion, Vector3 } from 'three'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { useEngine } from '../../ecs/classes/Engine'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { RenderedComponent } from '../../scene/components/RenderedComponent'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'

const localUserQuery = defineQuery([LocalInputTagComponent, AvatarComponent])
const upVec = new Vector3(0, 1, 0)

export const createInteractText = (displayText: string | undefined) => {
  //Create interactive text
  const geometry = FontManager.instance.create3dText(displayText ? displayText : 'INTERACT', new Vector3(1.6, 2, 0.4))

  const textSize = 0.1
  const text = new Mesh(geometry, new MeshPhongMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 1 }))
  text.scale.setScalar(textSize)

  const interactTextEntity = createEntity()
  const textGroup = new Group().add(text)
  addComponent(interactTextEntity, Object3DComponent, { value: textGroup })
  useEngine().scene.add(textGroup)

  addComponent(interactTextEntity, PersistTagComponent, {})
  const transformComponent = addComponent(interactTextEntity, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
  transformComponent.scale.setScalar(0)
  textGroup.visible = false

  // @ts-ignore
  textGroup.update = (elapsedTime) => {
    for (const entity of localUserQuery()) {
      const interactTextObject = getComponent(interactTextEntity, Object3DComponent).value
      if (!interactTextObject.visible) return
      interactTextObject.children[0].position.y = Math.sin(elapsedTime * 1.8) * 0.05
      if (
        useEngine().activeCameraFollowTarget &&
        hasComponent(useEngine().activeCameraFollowTarget!, FollowCameraComponent)
      ) {
        interactTextObject.children[0].setRotationFromAxisAngle(
          upVec,
          MathUtils.degToRad(getComponent(useEngine().activeCameraFollowTarget!, FollowCameraComponent).theta)
        )
      } else {
        const { x, z } = getComponent(entity, TransformComponent).position
        interactTextObject.lookAt(x, interactTextObject.position.y, z)
      }
    }
  }
  addComponent(interactTextEntity, RenderedComponent, {})
  return interactTextEntity
}
export const showInteractText = (interactTextEntity: Entity, focusEntity: Entity) => {
  const transform = getComponent(interactTextEntity, TransformComponent)
  const { value } = getComponent(interactTextEntity, Object3DComponent)
  let yTarget = 0

  const bb = getComponent(focusEntity, BoundingBoxComponent)
  if (bb) {
    bb.box.getCenter(transform.position)
    yTarget = bb.box.max.y
  } else {
    const obj3d = getComponent(focusEntity, Object3DComponent).value as Mesh
    transform.position.copy(obj3d.position)
    if (obj3d.geometry) {
      yTarget = obj3d.geometry.boundingBox?.max.y ?? 0
    }
  }

  if (hasComponent(interactTextEntity, TweenComponent)) {
    getComponent(interactTextEntity, TweenComponent).tween.stop() // doesn't trigger onComplete
    removeComponent(interactTextEntity, TweenComponent)
  }
  value.visible = true

  addComponent(interactTextEntity, TweenComponent, {
    tween: new Tween<any>(transform)
      .to(
        {
          position: {
            y: yTarget + 0.5
          },
          scale: {
            x: 1,
            y: 1,
            z: 1
          }
        },
        1500
      )
      .easing(Easing.Exponential.Out)
      .start()
      .onComplete(() => {
        removeComponent(interactTextEntity, TweenComponent)
      })
  })
}

export const hideInteractText = (interactTextEntity: Entity) => {
  const transform = getComponent(interactTextEntity, TransformComponent)
  const { value } = getComponent(interactTextEntity, Object3DComponent)

  if (hasComponent(interactTextEntity, TweenComponent)) {
    getComponent(interactTextEntity, TweenComponent).tween.stop() // doesn't trigger onComplete
    removeComponent(interactTextEntity, TweenComponent)
  }

  addComponent(interactTextEntity, TweenComponent, {
    tween: new Tween<any>(transform)
      .to(
        {
          position: {
            y: transform.position.y - 0.5
          },
          scale: {
            x: 0,
            y: 0,
            z: 0
          }
        },
        500
      )
      .easing(Easing.Exponential.In)
      .start()
      .onComplete(() => {
        value.visible = false
        removeComponent(interactTextEntity, TweenComponent)
      })
  })
}
