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

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { Engine, UndefinedEntity } from '@etherealengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { MediaComponent, MediaElementComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createTransitionState } from '@etherealengine/spatial/src/common/functions/createTransitionState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@etherealengine/spatial/src/input/state/InputState'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { XRUIComponent } from '@etherealengine/spatial/src/xrui/components/XRUIComponent'
import { Vector3 } from 'three'
import { createMediaControlsView } from './ui/MediaControlsUI'

const scaleVector = new Vector3()
let clicking = false
const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
const mediaQuery = defineQuery([MediaComponent])

export const createMediaControlsUI = (entity: Entity) => {
  const ui = createMediaControlsView(entity)

  setComponent(ui.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  setComponent(ui.entity, NameComponent, 'mediacontrols-ui-' + entity)

  ui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })

  return ui
}

const onUpdate = (entity: Entity) => {
  const mediaComponent = getComponent(entity, MediaComponent)
  const xrui = getComponent(mediaComponent.xruiEntity, XRUIComponent)
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayer = xrui.rootLayer.querySelector('#button')

  const inputComponent = getComponent(entity, InputComponent)
  const inputSourceEntity = inputComponent?.inputSources[0]

  //inputsource and entity 0 = hover
  //inputsource and entity 3 = clicking HERE
  //noinput and entity 3 = clicking somewhere else or still clicking
  //noinputsource and entity 0 = no hover, no click
  const capturingEntity = getState(InputState).capturingEntity

  if (inputSourceEntity) {
    const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)

    if (capturingEntity !== UndefinedEntity) {
      const buttons = inputSource?.buttons
      clicking = !!buttons //clicking on our boundingbox this frame

      const mediaElement = getComponent(entity, MediaElementComponent)
      if (mediaElement) {
        mediaElement.element.paused ? mediaElement.element.play() : mediaElement.element.pause()
        //TODO move button element, see how to get it to change icons properly
      }
    }
  }

  const hover = inputSourceEntity && capturingEntity === UndefinedEntity
  const showUI = hover || clicking

  //fires one frame late to prevent mouse up frame issue
  if (clicking && !inputSourceEntity && capturingEntity === UndefinedEntity) {
    clicking = false
  }
  if (showUI) {
    transition.setState('IN')
  } else {
    transition.setState('OUT')
  }
  const uiTransform = getComponent(mediaComponent.xruiEntity, TransformComponent)
  const transform = getComponent(entity, TransformComponent)

  if (hasComponent(entity, MediaComponent)) {
    if (buttonLayer) {
      let buttonOffset = buttonLayer.domSize.y * xrui.rootLayer.domSize.y * 1.2 //HACK 1.2 is a magic number here to include the button border (10px on a 100px button)
      scaleVector.set(transform.scale.x * 0.5 - buttonOffset, -transform.scale.y * 0.5 - buttonOffset, 0)
    }
    const mediaComponent = getComponent(entity, MediaComponent)
    scaleVector.add(mediaComponent.uiOffset)
    scaleVector.add(transform.position)
    uiTransform.position.copy(scaleVector)
  }

  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    buttonLayer?.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

const execute = () => {
  if (getState(EngineState).isEditor || !isClient) return

  for (const entity of mediaQuery.enter()) {
    const mediaComponent = getComponent(entity, MediaComponent)
    if (!mediaComponent.controls) continue

    const transition = createTransitionState(0.25, 'IN')
    MediaFadeTransitions.set(entity, transition)
    mediaComponent.xruiEntity = createMediaControlsUI(entity).entity
    setComponent(mediaComponent.xruiEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  }

  for (const entity of mediaQuery.exit()) {
    if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
  }

  for (const entity of mediaQuery()) {
    onUpdate(entity)
  }
}

export const MediaControlSystem = defineSystem({
  uuid: 'ee.engine.MediaControlSystem',
  insert: { before: TransformSystem },
  execute
})
