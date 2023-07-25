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
import { NodeDefinition } from '../../Nodes/Registry/NodeDefinitionsMap.js'
import { getNodeDescriptions } from '../../Nodes/Registry/NodeDescription.js'
import { IRegistry } from '../../Registry.js'
import { ValueTypeMap } from '../../Values/ValueTypeMap.js'
import { memo } from '../../memo.js'
import { getStringConversionsForValueType } from '../registerSerializersForValueType.js'
import { OnCustomEvent } from './CustomEvents/OnCustomEvent.js'
import { TriggerCustomEvent } from './CustomEvents/TriggerCustomEvent.js'
import { ExpectTrue as AssertExpectTrue } from './Debug/AssertExpectTrue.js'
import { Log as DebugLog, loggerDependencyKey } from './Debug/DebugLog.js'
import { Branch } from './Flow/Branch.js'
import { Counter } from './Flow/Counter.js'
import { Debounce } from './Flow/Debounce.js'
import { DoN } from './Flow/DoN.js'
import { DoOnce } from './Flow/DoOnce.js'
import { FlipFlop } from './Flow/FlipFlop.js'
import { ForLoop } from './Flow/ForLoop.js'
import { Gate } from './Flow/Gate.js'
import { MultiGate } from './Flow/MultiGate.js'
import { Sequence } from './Flow/Sequence.js'
import { SwitchOnInteger } from './Flow/SwitchOnInteger.js'
import { SwitchOnString } from './Flow/SwitchOnString.js'
import { Throttle } from './Flow/Throttle.js'
import { WaitAll } from './Flow/WaitAll.js'
import { LifecycleOnEnd } from './Lifecycle/LifecycleOnEnd.js'
import { LifecycleOnStart, lifecycleEventEmitterDependencyKey } from './Lifecycle/LifecycleOnStart.js'
import { LifecycleOnTick } from './Lifecycle/LifecycleOnTick.js'
import { Easing } from './Logic/Easing.js'
import { ILifecycleEventEmitter } from './Profiles/Scene/Abstractions/ILifecycleEventEmitter.js'
import { ILogger } from './Profiles/Scene/Abstractions/ILogger.js'
import { Delay } from './Time/Delay.js'
import * as TimeNodes from './Time/TimeNodes.js'
import * as BooleanNodes from './Values/BooleanNodes.js'
import { BooleanValue } from './Values/BooleanValue.js'
import * as FloatNodes from './Values/FloatNodes.js'
import { FloatValue } from './Values/FloatValue.js'
import * as IntegerNodes from './Values/IntegerNodes.js'
import { IntegerValue } from './Values/IntegerValue.js'
import * as StringNodes from './Values/StringNodes.js'
import { StringValue } from './Values/StringValue.js'
import { VariableGet } from './Variables/VariableGet.js'
import { VariableSet } from './Variables/VariableSet.js'

export const makeCoreDependencies = ({
  lifecycleEmitter,
  logger
}: {
  lifecycleEmitter: ILifecycleEventEmitter
  logger: ILogger
}) => ({
  [lifecycleEventEmitterDependencyKey]: lifecycleEmitter,
  [loggerDependencyKey]: logger
})

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
    AssertExpectTrue.Description,

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
