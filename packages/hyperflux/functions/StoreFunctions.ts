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

import { Downgraded, State } from '@hookstate/core'
import { merge } from 'lodash'
import { Validator } from 'ts-matches'

import {
  ActionQueueDefinition,
  ActionReceptor,
  addOutgoingTopicIfNecessary,
  ResolvedActionType,
  Topic
} from './ActionFunctions'
import { ReactorRoot } from './ReactorFunctions'

export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never
export interface HyperStore {
  /**
   * The topic to dispatch to when none are supplied
   */
  defaultTopic: Topic
  /**
   *  If false, actions are dispatched on the incoming queue.
   *  If true, actions are dispatched on the incoming queue and then forwarded to the outgoing queue.
   */
  forwardIncomingActions: (action: Required<ResolvedActionType>) => boolean
  /**
   * A function which returns the dispatch id assigned to actions
   * @deprecated can be derived from agentId via mapping
   * */
  getDispatchId: () => string
  /**
   * A function which returns the agent id assigned to actions
   */
  getPeerId: () => string
  /**
   * A function which returns the current dispatch time (units are arbitrary)
   */
  getDispatchTime: () => number
  /**
   * A function which returns the current reactor root context
   **/
  getCurrentReactorRoot: () => ReactorRoot | undefined
  /**
   * The default dispatch delay (default is 0)
   */
  defaultDispatchDelay: () => number
  /**
   * State dictionary
   */
  stateMap: { [type: string]: State<any> }
  /**
   * Underlying non-reactive states
   */
  valueMap: { [type: string]: any }

  actions: {
    queueDefinitions: Map<string, Array<ActionQueueDefinition>>
    /** */
    queues: Map<ActionQueueDefinition, Array<ResolvedActionType>>
    /** Cached actions */
    cached: Array<Required<ResolvedActionType>>
    /** Incoming actions */
    incoming: Array<Required<ResolvedActionType>>
    /** All actions that have been applied, in the order they were processed */
    history: Array<ResolvedActionType>
    /** All action UUIDs that have been processed and should not be processed again */
    knownUUIDs: Set<string>
    /** Outgoing actions */
    outgoing: Record<
      string,
      {
        /** All actions that are waiting to be sent */
        queue: Array<Required<ResolvedActionType>>
        /** All actions that have been sent */
        history: Array<Required<ResolvedActionType>>
        /** All incoming action UUIDs that have been processed */
        historyUUIDs: Set<string>
      }
    >
  }
  /** functions that receive actions */
  receptors: ReadonlyArray<ActionReceptor>

  /** active reactors */
  activeReactors: Set<ReactorRoot>
}

export class HyperFlux {
  static store: HyperStore
}

export function createHyperStore(options: {
  forwardIncomingActions?: (action: Required<ResolvedActionType>) => boolean
  getDispatchId: () => string
  getPeerId: () => string
  getDispatchTime: () => number
  getCurrentReactorRoot?: () => ReactorRoot | undefined
  defaultDispatchDelay?: () => number
}) {
  const store = {
    defaultTopic: 'default' as Topic,
    forwardIncomingActions: options.forwardIncomingActions ?? (() => false),
    getDispatchId: options.getDispatchId,
    getPeerId: options.getPeerId,
    getDispatchTime: options.getDispatchTime,
    getCurrentReactorRoot: options.getCurrentReactorRoot ?? (() => null),
    defaultDispatchDelay: options.defaultDispatchDelay ?? (() => 0),

    stateMap: {},
    valueMap: {},
    actions: {
      queueDefinitions: new Map(),
      queues: new Map(),
      cached: [],
      incoming: [],
      history: [],
      knownUUIDs: new Set(),
      outgoing: {}
    },
    receptors: [],
    activeReactors: new Set(),
    toJSON: () => {
      const state = Object.entries(store.stateMap).reduce((obj, [name, state]) => {
        return merge(obj, { [name]: state.attach(Downgraded).value })
      }, {})
      return {
        ...store,
        state
      }
    }
  } as HyperStore
  HyperFlux.store = store
  addOutgoingTopicIfNecessary(store.defaultTopic)
  return store
}
