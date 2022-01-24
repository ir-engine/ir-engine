import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { World } from '../../ecs/classes/World'
import { createMediaControlsUI, getMediaControlsUI, removeMediaControlsUI } from '../functions/mediaControlsUI'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { Entity } from '../../ecs/classes/Entity'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { WebLayer3D } from '@etherealjs/web-layer/three'

export const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

export default async function MediaControlSystem(world: World) {
  const mediaQuery = defineQuery([MediaComponent])

  return () => {
    for (const entity of mediaQuery.enter(world)) {
      createMediaControlsUI(entity)
      const transition = createTransitionState(1)
      MediaFadeTransitions.set(entity, transition)
    }

    for (const entity of mediaQuery(world)) {
      const mediaControls = getMediaControlsUI(entity)
      const xrui = getComponent(mediaControls.entity, XRUIComponent)
      if (!xrui?.container) continue
      const transition = MediaFadeTransitions.get(entity)!
      console.log('hover', xrui.container.rootLayer.pseudoStates, mediaControls.state.mouseOver.value)
      if (xrui.container.rootLayer.pseudoStates.hover && !mediaControls.state.mouseOver.value) {
        transition.setState('IN')
        mediaControls.state.mouseOver.set(true)
      }
      if (!xrui.container.rootLayer.pseudoStates.hover && mediaControls.state.mouseOver.value) {
        transition.setState('OUT')
        mediaControls.state.mouseOver.set(false)
      }
      transition.update(world, (opacity) => {
        xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
          console.log('setOpacity', opacity)
          const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
          mat.opacity = opacity
          mat.visible = opacity > 0
        })
      })
    }

    for (const entity of mediaQuery.exit(world)) {
      removeMediaControlsUI(entity)
      MediaFadeTransitions.delete(entity)
    }
  }
}
