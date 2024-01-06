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

import { ComponentJsonType } from '@etherealengine/common/src/schema.type.module'
import { Entity } from '../../ecs/classes/Entity'
import { getAllComponents, getOptionalComponent, serializeComponent } from '../../ecs/functions/ComponentFunctions'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'

export const serializeEntity = (entity: Entity) => {
  const ignoreComponents = getOptionalComponent(entity, GLTFLoadedComponent)

  const jsonComponents = [] as ComponentJsonType[]
  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = component.jsonID
    if (sceneComponentID && !ignoreComponents?.includes(component.name)) {
      const data = serializeComponent(entity, component)
      if (data) {
        jsonComponents.push({
          name: sceneComponentID,
          props: data
        })
      }
    }
  }
  return jsonComponents
}

globalThis.serializeEntity = serializeEntity
