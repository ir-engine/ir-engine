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
import * as bitecs from 'bitecs'
import { merge } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { Entity, UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { Query, QueryComponents } from '@etherealengine/engine/src/ecs/functions/QueryFunctions'
import { SystemUUID } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  ActionQueueHandle,
  ActionQueueInstance,
  ResolvedActionType,
  Topic,
  addOutgoingTopicIfNecessary
} from './ActionFunctions'
import { ReactorRoot } from './ReactorFunctions'
import { StateDefinitions, initializeState } from './StateFunctions'

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
   * The agent id
   */
  peerID: PeerID
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

  /**
   * The entity context used to match action receptor functions
   */
  receptorEntityContext: Entity

  actions: {
    /** All queues that have been created */
    queues: Map<ActionQueueHandle, ActionQueueInstance>
    /** The queue that is currently receiving and processing actions */
    activeQueue: ActionQueueInstance | null
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

  /** active reactors */
  activeReactors: Set<ReactorRoot>

  activeSystemReactors: Map<SystemUUID, ReactorRoot>
  currentSystemUUID: SystemUUID

  reactiveQueryStates: Set<{ query: Query; result: State<Entity[]>; components: QueryComponents }>

  systemPerformanceProfilingEnabled: boolean
}

export class HyperFlux {
  static store: HyperStore
}

export function createHyperStore(options: {
  forwardIncomingActions?: (action: Required<ResolvedActionType>) => boolean
  getDispatchId: () => string
  getPeerId: () => string
  getDispatchTime: () => number
  defaultDispatchDelay?: () => number
}) {
  const store = {
    defaultTopic: 'default' as Topic,
    forwardIncomingActions: options.forwardIncomingActions ?? (() => false),
    getDispatchId: options.getDispatchId,
    getPeerId: options.getPeerId,
    getDispatchTime: options.getDispatchTime,
    defaultDispatchDelay: options.defaultDispatchDelay ?? (() => 0),
    getCurrentReactorRoot: () => store.activeSystemReactors.get(store.currentSystemUUID),
    peerID: uuidv4() as PeerID,
    stateMap: {},
    valueMap: {},
    receptorEntityContext: UndefinedEntity,
    actions: {
      queueDefinitions: new Map(),
      queues: new Map(),
      activeQueue: null,
      cached: [],
      incoming: [],
      history: [],
      knownUUIDs: new Set(),
      outgoing: {}
    },
    activeReactors: new Set(),
    activeSystemReactors: new Map<SystemUUID, ReactorRoot>(),
    currentSystemUUID: '__null__' as SystemUUID,
    reactiveQueryStates: new Set<{ query: Query; result: State<Entity[]>; components: QueryComponents }>(),
    toJSON: () => {
      const state = Object.entries(store.stateMap).reduce((obj, [name, state]) => {
        return merge(obj, { [name]: state.attach(Downgraded).value })
      }, {})
      return {
        ...store,
        state
      }
    },
    systemPerformanceProfilingEnabled: false
  } as HyperStore
  HyperFlux.store = store
  bitecs.createWorld(store)
  addOutgoingTopicIfNecessary(store.defaultTopic)
  for (const StateDefinition of StateDefinitions.values()) {
    initializeState(StateDefinition)
  }
  return store
}
