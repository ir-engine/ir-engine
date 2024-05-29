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

import { getNodeDescriptions, IRegistry, memo, NodeDefinition, ValueTypeMap } from '../../VisualScriptModule'
import { getStringConversionsForValueType } from '../registerSerializersForValueType'
import { ExpectTrue as AssertExpectTrue } from './debug/AssertExpectTrue'
import { Log as DebugLog } from './debug/DebugLog'
import { Branch } from './flow/Branch'
import { Counter } from './flow/Counter'
import { Debounce } from './flow/Debounce'
import { DoN } from './flow/DoN'
import { DoOnce } from './flow/DoOnce'
import { FlipFlop } from './flow/FlipFlop'
import { ForLoop } from './flow/ForLoop'
import { Gate } from './flow/Gate'
import { MultiGate } from './flow/MultiGate'
import { Sequence } from './flow/Sequence'
import { SwitchOnInteger } from './flow/SwitchOnInteger'
import { SwitchOnString } from './flow/SwitchOnString'
import { Throttle } from './flow/Throttle'
import { WaitAll } from './flow/WaitAll'
import { LifecycleOnStart } from './lifecycle/LifecycleOnStart'
import { Easing } from './logic/Easing'
import { Delay } from './time/Delay'
import * as TimeNodes from './time/TimeNodes'
import * as BooleanNodes from './values/BooleanNodes'
import { BooleanValue } from './values/BooleanValue'
import * as FloatNodes from './values/FloatNodes'
import { FloatValue } from './values/FloatValue'
import * as IntegerNodes from './values/IntegerNodes'
import { IntegerValue } from './values/IntegerValue'
import * as StringNodes from './values/StringNodes'
import { StringValue } from './values/StringValue'

export const getCoreValuesMap = memo<ValueTypeMap>(() => {
  const valueTypes = [BooleanValue, StringValue, IntegerValue, FloatValue]
  return Object.fromEntries(valueTypes.map((valueType) => [valueType.name, valueType]))
})

function getCoreStringConversions(values: ValueTypeMap): NodeDefinition[] {
  return Object.keys(getCoreValuesMap())
    .filter((name) => name !== 'string')
    .flatMap((valueTypeName) => getStringConversionsForValueType({ values, valueTypeName }))
}

export const getCoreNodesMap = memo<Record<string, NodeDefinition>>(() => {
  const nodeDefinitions = [
    ...getNodeDescriptions(StringNodes),
    ...getNodeDescriptions(BooleanNodes),
    ...getNodeDescriptions(IntegerNodes),
    ...getNodeDescriptions(FloatNodes),

    // custom events
    //OnCustomEvent.Description,
    //TriggerCustomEvent.Description,
    // complex logic
    Easing,

    // actions
    DebugLog,
    AssertExpectTrue,

    // events
    LifecycleOnStart,
    //LifecycleOnEnd,
    //LifecycleOnTick,

    // time
    Delay.Description,
    ...getNodeDescriptions(TimeNodes),

    // flow control
    Branch,
    FlipFlop,
    ForLoop,
    Sequence,
    SwitchOnInteger,
    SwitchOnString,
    Debounce.Description,
    Throttle.Description,
    DoN,
    DoOnce,
    Gate,
    MultiGate,
    WaitAll.Description,
    Counter,

    ...getCoreStringConversions(getCoreValuesMap())
  ]
  return Object.fromEntries(nodeDefinitions.map((nodeDefinition) => [nodeDefinition.typeName, nodeDefinition]))
})

export const registerCoreProfile = (registry: IRegistry): IRegistry => {
  const values = { ...registry.values, ...getCoreValuesMap() }
  return {
    values,
    nodes: { ...registry.nodes, ...getCoreNodesMap() },
    dependencies: { ...registry.dependencies }
  }
}
