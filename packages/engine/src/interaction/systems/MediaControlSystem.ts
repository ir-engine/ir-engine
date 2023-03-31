import { getMutableState } from '@etherealengine/hyperflux'
import { WebLayer3D } from '@etherealengine/xrui'

import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { createMediaControlsUI } from '../functions/mediaControlsUI'
import { addInteractableUI } from './InteractiveSystem'

export const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const onUpdate = () => (entity: Entity, mediaControls: ReturnType<typeof createMediaControlsUI>) => {
  const xrui = getComponent(mediaControls.entity, XRUIComponent)
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayer = xrui.rootLayer.querySelector('button')
  const group = getOptionalComponent(entity, GroupComponent)
  const intersectObjects = group ? Engine.instance.pointerScreenRaycaster.intersectObjects(group, true) : []
  if (intersectObjects.length) {
    transition.setState('IN')
  }
  if (!intersectObjects.length) {
    transition.setState('OUT')
  }
  transition.update(Engine.instance.deltaSeconds, (opacity) => {
    buttonLayer?.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export default async function MediaControlSystem() {
  /** @todo, remove this when we have better system pipeline injection */
  if (getMutableState(EngineState).isEditor.value) return { execute: () => {}, cleanup: async () => {} }

  const mediaQuery = defineQuery([MediaComponent])

  const update = onUpdate()

  const execute = () => {
    for (const entity of mediaQuery.enter()) {
      if (!getComponent(entity, MediaComponent).controls) continue
      addInteractableUI(entity, createMediaControlsUI(entity), update)
      const transition = createTransitionState(0.25)
      transition.setState('OUT')
      MediaFadeTransitions.set(entity, transition)
    }

    for (const entity of mediaQuery.exit()) {
      if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
    }
  }

  const cleanup = async () => {
    removeQuery(mediaQuery)
  }

  return { execute, cleanup }
}
