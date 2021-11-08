import { Easing, Tween } from '@tweenjs/tween.js'
import { Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { Quaternion, Vector3 } from 'three'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'

import { createInteractiveModalView } from '../ui/InteractiveModalView'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { InteractableComponent } from '../components/InteractableComponent'

export const InteactiveUI = new Map<Entity, ReturnType<typeof createInteractiveModalView>>()

export const createInteractUI = (entity: Entity) => {
  const interactiveComponent = getComponent(entity, InteractableComponent)
  if (getInteractUI(entity) || !interactiveComponent || !interactiveComponent.data) return
  const ui = createInteractiveModalView(interactiveComponent.data)
  InteactiveUI.set(entity, ui)
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(0, 3, 0),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
}

export const showInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const { value } = getComponent(ui.entity, Object3DComponent)
  value.visible = true
}

export const hideInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const { value } = getComponent(ui.entity, Object3DComponent)
  value.visible = false
}

export const getInteractUI = (entity: Entity) => {
  let ui = InteactiveUI.get(entity)
  if (ui) return ui
  return false
}
