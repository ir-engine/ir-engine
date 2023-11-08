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

/* eslint-disable max-len */
import {
  IRegistry,
  NodeDefinition,
  ValueTypeMap,
  getNodeDescriptions,
  getStringConversionsForValueType,
  memo
} from '@behave-graph/core'
import { GetSceneProperty, SetSceneProperty } from '@behave-graph/scene'
import { OnAxis } from './Events/onAxis'
import { OnButton } from './Events/onButton'
import { OnExecute } from './Events/onExecute'
import { OnQuery } from './Events/onQuery'
import * as AxisNodes from './Values/AxisNodes'
import * as ComponentNodes from './Values/ComponentNodes'
import * as CustomNodes from './Values/CustomNodes'
import * as EntityNodes from './Values/EntityNodes'
import * as QueryNodes from './Values/QueryNodes'

import { EntityValue } from './Values/EntityValue'
import * as SplineNodes from './Values/SplineNodes'
import { getActionConsumers, getActionDispatchers } from './helper/actionHelper'
import { getComponentGetters, getComponentSetters } from './helper/componentHelper'
import { getStateGetters, getStateSetters } from './helper/stateHelper'

export const makeEngineDependencies = () => ({})

export const getEngineValuesMap = memo<ValueTypeMap>(() => {
  const valueTypes = [EntityValue]
  return Object.fromEntries(valueTypes.map((valueType) => [valueType.name, valueType]))
})

function getEngineStringConversions(values: ValueTypeMap): NodeDefinition[] {
  return Object.keys(getEngineValuesMap())
    .filter((name) => name !== 'string')
    .flatMap((valueTypeName) => getStringConversionsForValueType({ values, valueTypeName }))
}

export const getEngineNodesMap = memo<Record<string, NodeDefinition>>(() => {
  const engineValueTypeNames = Object.keys({
    ...getEngineValuesMap()
  })
  const nodeDefinitions = [
    ...getNodeDescriptions(EntityNodes),
    ...getNodeDescriptions(ComponentNodes),
    ...getNodeDescriptions(CustomNodes),
    ...getNodeDescriptions(SplineNodes),
    ...getNodeDescriptions(QueryNodes),
    ...getNodeDescriptions(AxisNodes),

    // variables

    // complex logic

    // actions

    // events
    OnButton, // click included
    OnQuery,
    OnExecute,
    OnAxis,
    // async
    //switchScene.Description,
    ...SetSceneProperty(engineValueTypeNames),
    ...GetSceneProperty(engineValueTypeNames),
    // flow control

    ...getEngineStringConversions(getEngineValuesMap()),
    ...getComponentSetters(),
    ...getComponentGetters(),
    ...getStateSetters(),
    ...getStateGetters(),
    ...getActionDispatchers(),
    ...getActionConsumers()
  ]
  return Object.fromEntries(nodeDefinitions.map((nodeDefinition) => [nodeDefinition.typeName, nodeDefinition]))
})

export const registerEngineProfile = (registry: IRegistry): IRegistry => {
  const values = { ...registry.values, ...getEngineValuesMap() }
  return {
    values,
    nodes: { ...registry.nodes, ...getEngineNodesMap() },
    dependencies: { ...registry.dependencies }
  }
}
