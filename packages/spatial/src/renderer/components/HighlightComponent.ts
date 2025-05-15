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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { defineQuery, defineSystem, Engine, Entity } from '@ir-engine/ecs'
import { defineComponent, getComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { OutlineEffect } from 'postprocessing'
import { WebGLRendererSystem } from '../WebGLRendererSystem'
import { MeshComponent } from './MeshComponent'
import { RendererComponent } from './RendererComponent'
import { VisibleComponent } from './VisibleComponent'

export const HighlightComponent = defineComponent({ name: 'HighlightComponent' })

const highlightQuery = defineQuery([HighlightComponent, MeshComponent, VisibleComponent])

const getCompObject = (entity: Entity) => getComponent(entity, MeshComponent)

const execute = () => {
  /** @todo support multiple scenes */
  if (!hasComponent(Engine.instance.viewerEntity, RendererComponent)) return

  const rendererComponent = getComponent(Engine.instance.viewerEntity, RendererComponent)
  const outlineEffect = rendererComponent?.effectInstances?.OutlineEffect as OutlineEffect
  outlineEffect?.selection.set(highlightQuery().map(getCompObject))
}

export const HighlightSystem = defineSystem({
  uuid: 'ir.spatial.render.HighlightSystem',
  insert: { before: WebGLRendererSystem },
  execute
})
