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

import { defineQuery, defineSystem, Engine } from '@etherealengine/ecs'
import { defineComponent, getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'

import { Object3D } from 'three'
import { traverseEntityNode } from '../../transform/components/EntityTree'
import { RendererComponent, WebGLRendererSystem } from '../WebGLRendererSystem'
import { GroupComponent } from './GroupComponent'
import { MeshComponent } from './MeshComponent'
import { VisibleComponent } from './VisibleComponent'

export const HighlightComponent = defineComponent({ name: 'HighlightComponent' })

const highlightQuery = defineQuery([HighlightComponent, VisibleComponent])

const execute = () => {
  /** @todo support multiple scenes */
  if (!hasComponent(Engine.instance.viewerEntity, RendererComponent)) return

  let highlightObjects: Object3D[] = []
  for (const entity of highlightQuery()) {
    traverseEntityNode(entity, (child, index) => {
      if (!hasComponent(child, MeshComponent)) return
      if (!hasComponent(child, GroupComponent)) return
      highlightObjects.push(getComponent(child, MeshComponent))
    })
  }
  const rendererComponent = getComponent(Engine.instance.viewerEntity, RendererComponent)
  // @ts-ignore @todo why does typescript freak out here?
  rendererComponent.effectComposer?.OutlineEffect?.selection.set(highlightObjects)
}

export const HighlightSystem = defineSystem({
  uuid: 'HighlightSystem',
  insert: { before: WebGLRendererSystem },
  execute
})
