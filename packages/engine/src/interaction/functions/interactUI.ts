import { WebLayer3D } from '@etherealjs/web-layer/three'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createInteractiveModalView } from '../ui/InteractiveModalView'

export function createInteractUI(entity: Entity, interactMessage: string) {
  const ui = createInteractiveModalView(entity, interactMessage)
  const nameComponent = getComponent(entity, NameComponent)
  addComponent(ui.entity, NameComponent, { name: 'interact-ui-' + nameComponent.name })
  ui.container.then(() => {
    const xrui = getComponent(ui.entity, XRUIComponent)
    xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.transparent = true
    })
    const position = createVector3Proxy(TransformComponent.position, ui.entity)
    const rotation = createQuaternionProxy(TransformComponent.rotation, ui.entity)
    const scale = createVector3Proxy(TransformComponent.scale, ui.entity)
    addComponent(ui.entity, TransformComponent, { position, rotation, scale })
    scale.setScalar(1)
  })
  return ui
}

export const updateInteractUI = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {}
