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
  getCoreValuesMap,
  getNodeDescriptions,
  getStringConversionsForValueType,
  IRegistry,
  memo,
  NodeDefinition,
  ValueType,
  ValueTypeMap
} from '../../'

import { SetSceneProperty } from './Nodes/Actions/SetSceneProperty.js'
import { OnSceneNodeClick } from './Nodes/Events/OnSceneNodeClick.js'
import * as ColorNodes from './Nodes/Logic/ColorNodes.js'
import * as EulerNodes from './Nodes/Logic/EulerNodes.js'
import * as Mat3Nodes from './Nodes/Logic/Mat3Nodes.js'
import * as Mat4Nodes from './Nodes/Logic/Mat4Nodes.js'
import * as QuatNodes from './Nodes/Logic/QuatNodes.js'
import * as Vec2Nodes from './Nodes/Logic/Vec2Nodes.js'
import * as Vec3Nodes from './Nodes/Logic/Vec3Nodes.js'
import * as Vec4Nodes from './Nodes/Logic/Vec4Nodes.js'
import { GetSceneProperty } from './Nodes/Queries/GetSceneProperty.js'
import { ColorValue } from './Values/ColorValue.js'
import { EulerValue } from './Values/EulerValue.js'
import { Mat3Value } from './Values/Mat3Value.js'
import { Mat4Value } from './Values/Mat4Value.js'
import { QuatValue } from './Values/QuatValue.js'
import { Vec2Value } from './Values/Vec2Value.js'
import { Vec3Value } from './Values/Vec3Value.js'
import { Vec4Value } from './Values/Vec4Value.js'

export const getSceneValuesMap = memo<ValueTypeMap>(() => {
  const valueTypes = [Vec2Value, Vec3Value, Vec4Value, ColorValue, EulerValue, QuatValue, Mat3Value, Mat4Value]
  const temp = Object.fromEntries(valueTypes.map((valueType) => [valueType.name, valueType]))
  return temp
})

export const getSceneStringConversions = (values: Record<string, ValueType>): NodeDefinition[] =>
  Object.keys(values).flatMap((valueTypeName) => getStringConversionsForValueType({ values, valueTypeName }))

export const getSceneNodesMap = memo<Record<string, NodeDefinition>>(() => {
  const allValueTypeNames = Object.keys({
    ...getCoreValuesMap(),
    ...getSceneValuesMap()
  })

  const nodeDefinitions = [
    // pull in value type nodes
    ...getNodeDescriptions(Vec2Nodes),
    ...getNodeDescriptions(Vec3Nodes),
    ...getNodeDescriptions(Vec4Nodes),
    ...getNodeDescriptions(ColorNodes),
    ...getNodeDescriptions(EulerNodes),
    ...getNodeDescriptions(QuatNodes),
    ...getNodeDescriptions(Mat3Nodes),
    ...getNodeDescriptions(Mat4Nodes),

    // events
    OnSceneNodeClick,
    // actions
    ...SetSceneProperty(allValueTypeNames),
    ...GetSceneProperty(allValueTypeNames),

    ...getSceneStringConversions(getSceneValuesMap())
  ]

  return Object.fromEntries(nodeDefinitions.map((nodeDefinition) => [nodeDefinition.typeName, nodeDefinition]))
})

export const registerSceneProfile = (registry: IRegistry): IRegistry => {
  const values = {
    ...registry.values,
    ...getCoreValuesMap(),
    ...getSceneValuesMap()
  }
  return {
    values,
    nodes: { ...registry.nodes, ...getSceneNodesMap() },
    dependencies: {
      ...registry.dependencies
    }
  }
}
