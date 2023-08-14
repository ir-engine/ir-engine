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

import { GraphJSON, IRegistry } from '@behave-graph/core'
import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

import { getState } from '@etherealengine/hyperflux'
import { useEffect, useState } from 'react'
import { cleanStorageProviderURLs, parseStorageProviderURLs } from '../../common/functions/parseSceneJSON'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useGraphRunner } from '../functions/useGraphRunner'
import { useRegistry } from '../functions/useRegistry'
import DefaultGraph from '../graph/default-graph.json'
import { BehaveGraphState } from '../state/BehaveGraphState'

export type GraphDomainID = OpaqueType<'GraphDomainID'> & string

export const BehaveGraphComponent = defineComponent({
  name: 'EE_behaveGraph',

  jsonID: 'BehaveGraph',

  onInit: (entity) => {
    const domain = 'ECS' as GraphDomainID
    const graph = parseStorageProviderURLs(DefaultGraph) as unknown as GraphJSON
    const registry = useRegistry()
    const systemState = getState(BehaveGraphState)
    systemState.domains[domain]?.register(registry)
    systemState.registry = registry
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
      run: false, // we always want it to be false when saving, so scripts dont startup in the editor, we make true for runtime
      disabled: component.disabled.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.disabled === 'boolean') component.disabled.set(json.disabled)
    if (typeof json.run === 'boolean') component.run.set(json.run)

    const domainValidator = matches.string as Validator<unknown, GraphDomainID>
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
    const graphComponent = useComponent(entity, BehaveGraphComponent)
    const [graphJson, setGraphJson] = useState<GraphJSON>(graphComponent.graph.value)
    const [registry, setRegistry] = useState<IRegistry>(getState(BehaveGraphState).registry)
    const canPlay = graphComponent.run && !graphComponent.disabled
    useEffect(() => {
      if (graphComponent.disabled.value) {
        graphRunner.pause()
        if (graphComponent.run.value) graphComponent.run.set(false)
      } else {
        graphComponent.run.value ? graphRunner.play() : graphRunner.pause()
      }
    }, [graphComponent.run, graphComponent.disabled])
    const graphRunner = useGraphRunner({ graphJson, autoRun: canPlay, registry })
    return null
  }
})
