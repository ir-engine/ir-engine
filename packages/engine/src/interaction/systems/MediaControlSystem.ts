import { WebLayer3D } from '@etherealjs/web-layer/three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { createMediaControlsUI } from '../functions/mediaControlsUI'
import { addInteractableUI } from './InteractiveSystem'

export const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const onUpdate = (world: World) => (entity: Entity, mediaControls: ReturnType<typeof createMediaControlsUI>) => {
  const xrui = getComponent(mediaControls.entity, XRUIComponent)
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayer = xrui.container.rootLayer.querySelector('button')!
  const model = getComponent(entity, Object3DComponent).value
  const intersectObjects = world.pointerScreenRaycaster.intersectObject(model, true)
  if (intersectObjects.length && !mediaControls.state.mouseOver.value) {
    transition.setState('IN')
    mediaControls.state.mouseOver.set(true)
  }
  if (!intersectObjects.length && mediaControls.state.mouseOver.value) {
    transition.setState('OUT')
    mediaControls.state.mouseOver.set(false)
  }
  transition.update(world.deltaSeconds, (opacity) => {
    buttonLayer.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export default async function MediaControlSystem(world: World) {
  /** @todo, remove this when we have better system pipeline injection */
  if (Engine.instance.isEditor) return () => {}

  const mediaQuery = defineQuery([MediaComponent, MediaElementComponent])

  const update = onUpdate(world)

  return () => {
    for (const entity of mediaQuery.enter(world)) {
      if (!getComponent(entity, MediaComponent).controls) return
      addInteractableUI(entity, createMediaControlsUI(entity), update)
      const transition = createTransitionState(0.25)
      transition.setState('OUT')
      MediaFadeTransitions.set(entity, transition)
    }

    for (const entity of mediaQuery.exit(world)) {
      if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
      const mediaComponent = getComponent(entity, MediaElementComponent, true)
      mediaComponent?.remove()
    }
  }
}
