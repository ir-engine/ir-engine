import { WebLayer3D } from '@etherealjs/web-layer/three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { addEntityNodeChild, createEntityNode } from '../../ecs/functions/EntityTree'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createInteractiveModalView } from '../ui/InteractiveModalView'

export function createInteractUI(entity: Entity, interactMessage: string) {
  const ui = createInteractiveModalView(entity, interactMessage)
  const nameComponent = getComponent(entity, NameComponent)
  addComponent(ui.entity, NameComponent, { name: 'interact-ui-' + nameComponent.name })

  addEntityNodeChild(createEntityNode(ui.entity), Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!)

  const xrui = getComponent(ui.entity, XRUIComponent)
  xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })
  const transform = getComponent(ui.entity, TransformComponent)
  transform.scale.setScalar(1)

  return ui
}

export const updateInteractUI = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {}
