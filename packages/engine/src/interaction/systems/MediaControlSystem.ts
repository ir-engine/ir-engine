/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { getState } from '@etherealengine/hyperflux'
import { WebLayer3D } from '@etherealengine/xrui'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputState } from '../../input/state/InputState'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { createMediaControlsUI } from '../functions/mediaControlsUI'
import { addInteractableUI } from './InteractiveSystem'

export const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const onUpdate = (entity: Entity, mediaControls: ReturnType<typeof createMediaControlsUI>) => {
  const xrui = getComponent(mediaControls.entity, XRUIComponent)
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayer = xrui.rootLayer.querySelector('button')
  const group = getOptionalComponent(entity, GroupComponent)
  const pointerScreenRaycaster = getState(InputState).pointerScreenRaycaster
  const intersectObjects = group ? pointerScreenRaycaster.intersectObjects(group, true) : []
  if (intersectObjects.length) {
    transition.setState('IN')
  }
  if (!intersectObjects.length) {
    transition.setState('OUT')
  }
  const deltaSeconds = getState(EngineState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    buttonLayer?.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

const mediaQuery = defineQuery([MediaComponent])

const execute = () => {
  if (getState(EngineState).isEditor) return

  for (const entity of mediaQuery.enter()) {
    if (!getComponent(entity, MediaComponent).controls) continue
    addInteractableUI(entity, createMediaControlsUI(entity), onUpdate)
    const transition = createTransitionState(0.25)
    transition.setState('OUT')
    MediaFadeTransitions.set(entity, transition)
  }

  for (const entity of mediaQuery.exit()) {
    if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
  }
}

export const MediaControlSystem = defineSystem({
  uuid: 'ee.engine.MediaControlSystem',
  execute
})
