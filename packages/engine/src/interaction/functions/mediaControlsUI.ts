import { Entity } from '../../ecs/classes/Entity'
import { Box3, Mesh, Quaternion, Vector3 } from 'three'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createMediaControlsView } from '../ui/MediaControlsUI'
import { NameComponent } from '../../scene/components/NameComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'

export const MediaUI = new Map<Entity, ReturnType<typeof createMediaControlsView>>()

export const createMediaControlsUI = (entity: Entity) => {
  console.log('createMediaControlsUI ', entity)
  const mediaComponent = getComponent(entity, MediaComponent)
  if (getMediaControlsUI(entity) || !mediaComponent) return

  const ui = createMediaControlsView(mediaComponent, entity)
  MediaUI.set(entity, ui)
  addComponent(ui.entity, NameComponent, {
    name: 'mediacontrols-ui-' + (mediaComponent.el ? mediaComponent.el.src : entity)
  })

  mediaComponent.el?.addEventListener('playing', () => {
    ui.state.merge({ playing: true })
  })
  mediaComponent.el?.addEventListener('pause', () => {
    ui.state.merge({ playing: false })
  })

  const transform = getComponent(entity, TransformComponent)
  const obj = getComponent(entity, Object3DComponent).value
  obj.traverse((o: Mesh) => {
    if (o.geometry) o.geometry.computeBoundingBox()
  })
  const box = new Box3()
  box.setFromObject(obj)
  const halfHeight = (box.max.y - box.min.y) / 2

  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(transform.position.x, transform.position.y - halfHeight, transform.position.z),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
}

export const getMediaControlsUI = (entity: Entity) => {
  let ui = MediaUI.get(entity)
  if (ui) return ui
  return false
}

export const removeMediaControlsUI = (entity: Entity) => {
  // todo
}
