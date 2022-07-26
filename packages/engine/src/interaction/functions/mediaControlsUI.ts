import { WebLayer3D } from '@etherealjs/web-layer/three'
import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createMediaControlsView } from '../ui/MediaControlsUI'

export const createMediaControlsUI = (entity: Entity) => {
  const mediaComponent = getComponent(entity, MediaComponent)

  const ui = createMediaControlsView(mediaComponent, entity)

  addComponent(ui.entity, NameComponent, {
    name: 'mediacontrols-ui-' + (mediaComponent.el ? mediaComponent.el.src : entity)
  })
  ui.container.then(() => {
    const xrui = getComponent(ui.entity, XRUIComponent)
    xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.transparent = true
    })
  })

  const transform = getComponent(entity, TransformComponent)

  addComponent(ui.entity, TransformComponent, {
    position: new Vector3().copy(transform.position),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  return ui
}
