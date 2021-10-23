import { Easing, Tween } from '@tweenjs/tween.js'
import { Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'

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
        1500
      )
      .easing(Easing.Exponential.In)
      .start()
      .onComplete(() => {
        value.visible = false
        removeComponent(interactTextEntity, TweenComponent)
      })
  })
}
