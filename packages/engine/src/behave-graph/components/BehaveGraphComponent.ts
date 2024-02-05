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

import matches, { Validator } from 'ts-matches'

import { GraphJSON } from '@behave-graph/core'

import { defineComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import {
  cleanStorageProviderURLs,
  parseStorageProviderURLs
} from '@etherealengine/spatial/src/common/functions/parseSceneJSON'
import { useEffect } from 'react'
import { useGraphRunner } from '../functions/useGraphRunner'
import DefaultGraph from '../graph/default-graph.json'
import { BehaveGraphState } from '../state/BehaveGraphState'

export enum BehaveGraphDomain {
  'ECS' = 'ECS'
}

export const BehaveGraphComponent = defineComponent({
  name: 'EE_behaveGraph',
  jsonID: 'BehaveGraph',

  onInit: (entity) => {
    const domain = BehaveGraphDomain.ECS
    const graph = parseStorageProviderURLs(DefaultGraph) as unknown as GraphJSON
    return {
      domain: domain,
      graph: graph,
      run: false,
      disabled: false
    }
  },

  toJSON: (entity, component) => {
    return {
      domain: component.domain.value,
      graph: cleanStorageProviderURLs(JSON.parse(JSON.stringify(component.graph.get({ noproxy: true })))),
      run: false,
      disabled: component.disabled.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.disabled === 'boolean') component.disabled.set(json.disabled)
    if (typeof json.run === 'boolean') component.run.set(json.run)
    const domainValidator = matches.string as Validator<unknown, BehaveGraphDomain>
    if (domainValidator.test(json.domain)) {
      component.domain.value !== json.domain && component.domain.set(json.domain!)
    }
    const graphValidator = matches.object as Validator<unknown, GraphJSON>
    if (graphValidator.test(json.graph)) {
      component.graph.set(parseStorageProviderURLs(json.graph)!)
    }
  },

  // we make reactor for each component handle the engine
  reactor: () => {
    const entity = useEntityContext()
    const graph = useComponent(entity, BehaveGraphComponent)
    const behaveGraph = useHookstate(getMutableState(BehaveGraphState))

    const canPlay = graph.run && !graph.disabled
    const registry = behaveGraph.registries[graph.domain.value].get({ noproxy: true })
    const graphRunner = useGraphRunner({ graphJson: graph.graph.get({ noproxy: true }), autoRun: canPlay, registry })

    useEffect(() => {
      if (graph.disabled.value) return
      graph.run.value ? graphRunner.play() : graphRunner.pause()
    }, [graph.run])

    useEffect(() => {
      if (!graph.disabled.value) return
      graph.run.set(false)
    }, [graph.disabled])

    return null
  }
})
