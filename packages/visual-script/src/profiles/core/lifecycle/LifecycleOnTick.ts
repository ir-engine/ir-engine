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

import { Assert, makeEventNodeDefinition, NodeCategory } from '../../../VisualScriptModule'
import { ILifecycleEventEmitter } from '../abstractions/ILifecycleEventEmitter'

type State = {
  onTickEvent?: (() => void) | undefined
}

const makeInitialState = (): State => ({
  onTickEvent: undefined
})

export const LifecycleOnTick = makeEventNodeDefinition({
  typeName: 'flow/lifecycle/onTick',
  label: 'On Tick',
  category: NodeCategory.Flow,
  in: {},
  out: {
    flow: 'flow',
    deltaSeconds: 'float'
  },
  initialState: makeInitialState(),
  init: ({ state, commit, write, graph: { getDependency } }) => {
    Assert.mustBeTrue(state.onTickEvent === undefined)
    let lastTickTime = Date.now()
    const onTickEvent = () => {
      const currentTime = Date.now()
      const deltaSeconds = (currentTime - lastTickTime) * 0.001
      write('deltaSeconds', deltaSeconds)
      commit('flow')
      lastTickTime = currentTime
    }

    const lifecycleEventEmitter = getDependency<ILifecycleEventEmitter>('ILifecycleEventEmitter')

    lifecycleEventEmitter?.tickEvent.addListener(onTickEvent)

    return {
      onTickEvent
    }
  },
  dispose: ({ state: { onTickEvent }, graph: { getDependency } }) => {
    Assert.mustBeTrue(onTickEvent !== undefined)

    const lifecycleEventEmitter = getDependency<ILifecycleEventEmitter>('ILifecycleEventEmitter')

    if (onTickEvent) lifecycleEventEmitter?.tickEvent.removeListener(onTickEvent)

    return {}
  }
})
