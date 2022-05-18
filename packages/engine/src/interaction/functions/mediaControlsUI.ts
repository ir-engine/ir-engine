import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createMediaControlsView } from '../ui/MediaControlsUI'

export const MediaUI = new Map<Entity, ReturnType<typeof createMediaControlsView>>()

export const createMediaControlsUI = (entity: Entity) => {
  const mediaComponent = getComponent(entity, MediaComponent)
  if (getMediaControlsUI(entity) || !mediaComponent) return

  const ui = createMediaControlsView(mediaComponent, entity)
  MediaUI.set(entity, ui)
  addComponent(ui.entity, NameComponent, {
    name: 'mediacontrols-ui-' + (mediaComponent.el ? mediaComponent.el.src : entity)
  })

  const transform = getComponent(entity, TransformComponent)
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(transform.position.x, transform.position.y, transform.position.z),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
}

export const getMediaControlsUI = (entity: Entity) => {
  return MediaUI.get(entity)!
}

export const removeMediaControlsUI = (entity: Entity) => {
  // todo
}
