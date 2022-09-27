import { WebLayer3D } from '@etherealjs/web-layer/three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { createMediaControlsUI } from '../functions/mediaControlsUI'
import { addInteractableUI } from './InteractiveSystem'

export const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const onUpdate = (world: World) => (entity: Entity, mediaControls: ReturnType<typeof createMediaControlsUI>) => {
  const xrui = getComponent(mediaControls.entity, XRUIComponent)
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayer = xrui.container.rootLayer.querySelector('button')
  const group = getComponent(entity, GroupComponent)
  const intersectObjects = group ? world.pointerScreenRaycaster.intersectObjects(group, true) : []
  if (intersectObjects.length) {
    transition.setState('IN')
  }
  if (!intersectObjects.length) {
    transition.setState('OUT')
  }
  transition.update(world.deltaSeconds, (opacity) => {
    buttonLayer?.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export default async function MediaControlSystem(world: World) {
  /** @todo, remove this when we have better system pipeline injection */
  if (Engine.instance.isEditor) return { execute: () => {}, cleanup: async () => {} }

  const mediaQuery = defineQuery([MediaComponent])

  const update = onUpdate(world)

  const execute = () => {
    for (const entity of mediaQuery.enter(world)) {
      if (!getComponent(entity, MediaComponent).controls.value) continue
      addInteractableUI(entity, createMediaControlsUI(entity), update)
      const transition = createTransitionState(0.25)
      transition.setState('OUT')
      MediaFadeTransitions.set(entity, transition)
    }

    for (const entity of mediaQuery.exit(world)) {
      if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
    }
  }

  const cleanup = async () => {
    removeQuery(world, mediaQuery)
  }

  return { execute, cleanup }
}
