import { WebLayer3D } from '@etherealjs/web-layer/three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { addEntityNodeChild, createEntityNode } from '../../ecs/functions/EntityTree'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createMediaControlsView } from '../ui/MediaControlsUI'

export const createMediaControlsUI = (entity: Entity) => {
  const ui = createMediaControlsView(entity)

  addEntityNodeChild(createEntityNode(ui.entity), Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!)

  addComponent(ui.entity, NameComponent, {
    name: 'mediacontrols-ui-' + entity
  })

  const xrui = getComponent(ui.entity, XRUIComponent)
  xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })

  const transform = getComponent(entity, TransformComponent)
  const uiTransform = getComponent(ui.entity, TransformComponent)
  uiTransform.position.copy(transform.position)

  return ui
}
