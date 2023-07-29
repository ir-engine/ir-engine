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
import { NodeDefinition } from '../../Nodes/Registry/NodeDefinitionsMap'
import { getNodeDescriptions } from '../../Nodes/Registry/NodeDescription'
import { IRegistry } from '../../Registry'
import { ValueTypeMap } from '../../Values/ValueTypeMap'
import { memo } from '../../memo'
import { getStringConversionsForValueType } from '../registerSerializersForValueType'
import { OnCustomEvent } from './CustomEvents/OnCustomEvent'
import { TriggerCustomEvent } from './CustomEvents/TriggerCustomEvent'
import { ExpectTrue as AssertExpectTrue } from './Debug/AssertExpectTrue'
import { Log as DebugLog } from './Debug/DebugLog'
import { Branch } from './Flow/Branch'
import { Counter } from './Flow/Counter'
import { Debounce } from './Flow/Debounce'
import { DoN } from './Flow/DoN'
import { DoOnce } from './Flow/DoOnce'
import { FlipFlop } from './Flow/FlipFlop'
import { ForLoop } from './Flow/ForLoop'
import { Gate } from './Flow/Gate'
import { MultiGate } from './Flow/MultiGate'
import { Sequence } from './Flow/Sequence'
import { SwitchOnInteger } from './Flow/SwitchOnInteger'
import { SwitchOnString } from './Flow/SwitchOnString'
import { Throttle } from './Flow/Throttle'
import { WaitAll } from './Flow/WaitAll'
import { LifecycleOnEnd } from './Lifecycle/LifecycleOnEnd'
import { LifecycleOnStart } from './Lifecycle/LifecycleOnStart'
import { LifecycleOnTick } from './Lifecycle/LifecycleOnTick'
import { Easing } from './Logic/Easing'
import { Delay } from './Time/Delay'
import * as TimeNodes from './Time/TimeNodes'
import * as BooleanNodes from './Values/BooleanNodes'
import { BooleanValue } from './Values/BooleanValue'
import * as FloatNodes from './Values/FloatNodes'
import { FloatValue } from './Values/FloatValue'
import * as IntegerNodes from './Values/IntegerNodes'
import { IntegerValue } from './Values/IntegerValue'
import * as StringNodes from './Values/StringNodes'
import { StringValue } from './Values/StringValue'
import { VariableGet } from './Variables/VariableGet'
import { VariableSet } from './Variables/VariableSet'

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
    OnCustomEvent.Description,
    TriggerCustomEvent.Description,

    // variables
    VariableGet,
    VariableSet,

    // complex logic
    Easing,

    // actions
    DebugLog,
    AssertExpectTrue,

    // events
    LifecycleOnStart,
    LifecycleOnEnd,
    LifecycleOnTick,

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
