import { WebLayer3D } from '@etherealengine/xrui'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { addEntityNodeChild } from '../../ecs/functions/EntityTree'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIInteractableComponent } from '../../xrui/components/XRUIComponent'
import { createMediaControlsView } from '../ui/MediaControlsUI'

export const createMediaControlsUI = (entity: Entity) => {
  const ui = createMediaControlsView(entity)
  setComponent(ui.entity, XRUIInteractableComponent)

  addEntityNodeChild(ui.entity, entity)

  addComponent(ui.entity, NameComponent, 'mediacontrols-ui-' + entity)

  ui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })

  const transform = getComponent(entity, TransformComponent)
  const uiTransform = getComponent(ui.entity, TransformComponent)
  uiTransform.position.copy(transform.position)

  return ui
}
