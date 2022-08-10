import { WebLayer3D } from '@etherealjs/web-layer/three'
import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createMediaControlsView } from '../ui/MediaControlsUI'

export const createMediaControlsUI = (entity: Entity) => {
  const mediaComponent = getComponent(entity, MediaComponent)
  const mediaElementComponent = getComponent(entity, MediaElementComponent)

  const ui = createMediaControlsView({ playing: mediaComponent.playing }, entity)

  addComponent(ui.entity, NameComponent, {
    name: 'mediacontrols-ui-' + mediaElementComponent.src
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
