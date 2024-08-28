/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Engine, getOptionalComponent } from '@ir-engine/ecs'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'

import { RendererComponent, WebGLRendererSystem } from './WebGLRendererSystem'

export const RenderInfoState = defineState({
  name: 'RenderInfoState',
  initial: {
    visible: false,
    info: {
      geometries: 0,
      textures: 0,
      fps: 0,
      frameTime: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      programs: 0
    }
  }
})

const execute = () => {
  const renderer = getOptionalComponent(Engine.instance.viewerEntity, RendererComponent)?.renderer
  if (!renderer) return

  const state = getState(RenderInfoState)
  if (state.visible) {
    const info = renderer.info
    const deltaSeconds = getState(ECSState).deltaSeconds

    const fps = 1 / deltaSeconds
    const frameTime = deltaSeconds * 1000

    getMutableState(RenderInfoState).info.set({
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      fps,
      frameTime,
      calls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      programs: info.programs?.length || 0
    })

    info.reset()
  }

  renderer.info.autoReset = !state.visible
}

export const RenderInfoSystem = defineSystem({
  uuid: 'ee.editor.RenderInfoSystem',
  insert: { with: WebGLRendererSystem },
  execute
})
