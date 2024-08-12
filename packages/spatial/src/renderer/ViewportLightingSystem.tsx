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

import { defineQuery, defineSystem, getComponent } from '@etherealengine/ecs'
import { getState, useMutableState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { AmbientLight } from 'three'
import { EngineState } from '../EngineState'
import { RendererState } from './RendererState'
import { WebGLRendererSystem } from './WebGLRendererSystem'
import { GroupComponent, addObjectToGroup, removeObjectFromGroup } from './components/GroupComponent'
import { LightTagComponent } from './components/lights/LightTagComponent'
import { RenderModes } from './constants/RenderModes'

const _tempAmbientLight = new AmbientLight()

const lightQuery = defineQuery([LightTagComponent, GroupComponent])

const execute = () => {
  const renderMode = getState(RendererState).renderMode
  if (renderMode === RenderModes.UNLIT) {
    for (const entity of lightQuery()) {
      const groupComponent = getComponent(entity, GroupComponent)
      groupComponent.forEach((child: any) => {
        child.visible = !child.isLight
      })
    }
  }
}

const reactor = () => {
  const renderer = useMutableState(RendererState)
  useEffect(() => {
    const root = getState(EngineState).originEntity
    renderer.renderMode.value === RenderModes.UNLIT
      ? addObjectToGroup(root, _tempAmbientLight)
      : removeObjectFromGroup(root, _tempAmbientLight)
  }, [renderer.renderMode])

  return null
}

export const ViewportLightingSystem = defineSystem({
  uuid: 'ee.engine.ViewportLightingSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
