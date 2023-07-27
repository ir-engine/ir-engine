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

import { GraphJSON } from 'behave-graph'
import matches, { Validator } from 'ts-matches'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

import { defineComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { RuntimeGraphComponent } from './RuntimeGraphComponent'

export type GraphDomainID = OpaqueType<'GraphDomainID'> & string

export const BehaveGraphComponent = defineComponent({
  name: 'EE_behaveGraph',

  jsonID: 'BehaveGraph',

  onInit: (entity) => {
    return {
      domain: 'ECS' as GraphDomainID,
      graph: {} as GraphJSON
    }
  },

  toJSON: (entity, component) => {
    return {
      domain: component.domain.value,
      graph: component.graph.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    const domainValidator = matches.string as Validator<unknown, GraphDomainID>
    if (domainValidator.test(json.domain)) {
      component.domain.value !== json.domain && component.domain.set(json.domain)
    }
    const graphValidator = matches.object as Validator<unknown, GraphJSON>
    if (graphValidator.test(json.graph)) {
      component.graph.value !== json.graph && component.graph.set(json.graph)
    }
  },

  onRemove: (entity, component) => {
    if (hasComponent(entity, RuntimeGraphComponent)) {
      removeComponent(entity, RuntimeGraphComponent)
    }
  }
})
