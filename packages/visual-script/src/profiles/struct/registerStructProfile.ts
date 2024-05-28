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

import { getNodeDescriptions, IRegistry, memo, NodeDefinition, ValueType, ValueTypeMap } from '../../VisualScriptModule'
import { getStringConversionsForValueType } from '../registerSerializersForValueType'
import { ListNodes, ObjectNodes, ObjectValue } from './StructProfileModule'
import { ListValue } from './values/ListValue'

export const getStructValuesMap = memo<ValueTypeMap>(() => {
  const valueTypes = [ObjectValue, ListValue]
  const temp = Object.fromEntries(valueTypes.map((valueType) => [valueType.name, valueType]))
  return temp
})

export const getStructStringConversions = (values: Record<string, ValueType>): NodeDefinition[] =>
  Object.keys(values).flatMap((valueTypeName) => getStringConversionsForValueType({ values, valueTypeName }))

export const getStructNodesMap = memo<Record<string, NodeDefinition>>(() => {
  /*const structValueTypeNames = Object.keys({
    ...getStructValuesMap()
  });*/ //only neeeded when creating nodes for scene properties

  const nodeDefinitions = [
    // pull in value type nodes
    ...getNodeDescriptions(ObjectNodes),
    ...getNodeDescriptions(ListNodes),
    //...SetSceneProperty(structValueTypeNames),
    //...GetSceneProperty(structValueTypeNames), //need imports from scene, not sure if we even want this
    ...getStructStringConversions(getStructValuesMap())
  ]

  return Object.fromEntries(nodeDefinitions.map((nodeDefinition) => [nodeDefinition.typeName, nodeDefinition]))
})

export const registerStructProfile = (registry: IRegistry): IRegistry => {
  const values = {
    ...registry.values,
    ...getStructValuesMap()
  }
  return {
    values,
    nodes: { ...registry.nodes, ...getStructNodesMap() },
    dependencies: {
      ...registry.dependencies
    }
  }
}
