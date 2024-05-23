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

// Generates node specs based on provided configuration,
// and caches the results.

import { useEffect, useState } from 'react'

import { getComponent } from '@etherealengine/ecs'
import { EngineVariableGet, EngineVariableSet, EngineVariableUse, VisualScriptComponent } from '@etherealengine/engine'
import {
  IRegistry,
  NodeConfigurationJSON,
  NodeSpecJSON,
  writeDefaultNodeSpecsToJSON,
  writeNodeSpecToJSON
} from '@etherealengine/visual-script'

import { SelectionState } from '../../../services/SelectionServices'

export class NodeSpecGenerator {
  private specsWithoutConfig?: NodeSpecJSON[]
  private specsCache: { [cacheKey: string]: NodeSpecJSON } = {}

  constructor(private registry: IRegistry) {}

  getNodeTypes(): string[] {
    return Object.keys(this.registry.nodes)
  }

  getNodeSpec(nodeTypeName: string, configuration: NodeConfigurationJSON): NodeSpecJSON {
    const entities = SelectionState.getSelectedEntities()
    const entity = entities[entities.length - 1]

    const visualScriptComponent = getComponent(entity, VisualScriptComponent)

    const generateCacheKey = () => {
      let cacheKey = nodeTypeName + '\x01' + JSON.stringify(configuration)
      if (!nodeTypeName.includes('variable')) return cacheKey
      const variableNames = visualScriptComponent.visualScript.variables?.map((variable) => {
        return { name: variable.name, type: variable.valueTypeName }
      })
      if (variableNames!.length === 0) return cacheKey
      cacheKey = nodeTypeName + '\x01' + JSON.stringify(configuration) + '\x01' + JSON.stringify(variableNames)
      return cacheKey
    }

    const cacheKey = generateCacheKey()
    if (!this.specsCache[cacheKey]) {
      const variableNodeAdjustSpec = () => {
        if (!nodeTypeName.includes('variable')) return
        const variable = visualScriptComponent.visualScript.variables?.find(
          (variable) => variable.name === configuration.variableName
        )
        if (variable === undefined) return
        let sockets = specJson.inputs
        switch (nodeTypeName) {
          case EngineVariableSet.typeName: {
            sockets = specJson.inputs
            break
          }
          case EngineVariableUse.typeName:
          case EngineVariableGet.typeName: {
            sockets = specJson.outputs
            break
          }
        }
        let valueSocket = sockets.find((socket) => socket.name === 'value')
        valueSocket = {
          ...valueSocket!,
          valueType: variable!.valueTypeName!
        }
        sockets = sockets.filter((socket) => socket.name !== 'value')
        sockets = [...sockets, valueSocket]
        switch (nodeTypeName) {
          case EngineVariableSet.typeName: {
            specJson.inputs = sockets
            break
          }
          case EngineVariableUse.typeName:
          case EngineVariableGet.typeName: {
            specJson.outputs = sockets
            break
          }
        }
        return
      }

      // variableNodeAdjustSpec could be potentially be moved into writeNodeSpecToJSON, by passing in the variables into writeNodeSpecToJSON
      // but writeNodeSpecToJSON is used in other places too,
      //unsure what unforeseen effects adding variables as an arguement and moving variableNodeAdjustSpec into writeNodeSpecToJSON will have
      const specJson = writeNodeSpecToJSON(this.registry, nodeTypeName, configuration)
      variableNodeAdjustSpec()
      this.specsCache[cacheKey] = specJson
    }

    return this.specsCache[cacheKey]
  }

  getAllNodeSpecs(): NodeSpecJSON[] {
    if (!this.specsWithoutConfig) {
      this.specsWithoutConfig = writeDefaultNodeSpecsToJSON(this.registry)
    }

    return this.specsWithoutConfig
  }
}

export const useNodeSpecGenerator = (registry: IRegistry) => {
  const [specGenerator, setSpecGenerator] = useState<NodeSpecGenerator>()

  useEffect(() => {
    setSpecGenerator(new NodeSpecGenerator(registry))
  }, [registry.nodes, registry.values, registry.dependencies])

  return specGenerator
}
