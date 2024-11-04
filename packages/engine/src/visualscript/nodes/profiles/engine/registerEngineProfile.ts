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

/* eslint-disable max-len */

import * as LegacyVolumetricNodes from '@ir-engine/engine/src/scene/components/LegacyVolumetricNodes'
import * as VolumetricNodes from '@ir-engine/engine/src/scene/components/VolumetricNodes'
import {
  getNodeDescriptions,
  getStringConversionsForValueType,
  IRegistry,
  memo,
  NodeDefinition,
  ValueTypeMap
} from '@ir-engine/visual-script'

import { OnButton } from './EngineProfileModule'
import { OnAxis } from './events/onAxis'
import { OnCollision } from './events/onCollision'
import { OnExecute } from './events/onExecute'
import { OnQuery } from './events/onQuery'
import { registerActionConsumers, registerActionDispatchers } from './helper/actionHelper'
import {
  registerComponentGetters,
  registerComponentListeners,
  registerComponentSetters
} from './helper/componentHelper'
import { registerStateGetters, registerStateListeners, registerStateSetters } from './helper/stateHelper'
import * as AxisNodes from './values/AxisNodes'
import * as ComponentNodes from './values/ComponentNodes'
import * as CustomNodes from './values/CustomNodes'
import * as EntityNodes from './values/EntityNodes'
import { EntityValue } from './values/EntityValue'
import * as QueryNodes from './values/QueryNodes'
import * as SplineNodes from './values/SplineNodes'
import * as VariableNodes from './values/VariableNodes'

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
    ...getNodeDescriptions(LegacyVolumetricNodes),
    ...getNodeDescriptions(VolumetricNodes),
    ...getNodeDescriptions(VariableNodes),
    // variables

    // complex logic

    // actions

    // events
    OnButton, // click included
    OnCollision,
    OnQuery,
    OnExecute,
    OnAxis,
    // async
    //switchScene.Description,
    //...SetSceneProperty(engineValueTypeNames),
    //...GetSceneProperty(engineValueTypeNames),
    // flow control

    ...getEngineStringConversions(getEngineValuesMap()),

    ...registerComponentSetters(),
    ...registerComponentGetters(),
    ...registerComponentListeners(),
    ...registerStateSetters(),
    ...registerStateGetters(),
    ...registerStateListeners(),
    ...registerActionConsumers(),
    ...registerActionDispatchers()
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
