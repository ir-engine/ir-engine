import type { WebLayer3D } from '@etherealjs/web-layer/three'

import { World } from '../../ecs/classes/World'
import { createTransitionState } from './createTransitionState'

export const TransitionFunctions = {
  changeOpacityOfRootLayer: (world: World, ui, xrui, transitionPeriodSeconds: number, visiblity: boolean) => {
    const transition = createTransitionState(transitionPeriodSeconds)

    transition.update(world, (opacity) => {
      let newOpacity = opacity

      if (visiblity) {
        ui.state.shareMenuOpen.set(visiblity)
        newOpacity = 1
      } else {
        newOpacity = 0
      }

      xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
        const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
        mat.opacity = newOpacity
        mat.visible = newOpacity > 0
        layer.visible = newOpacity > 0
      })
    })
  }
}
