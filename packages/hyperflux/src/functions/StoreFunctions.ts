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

import { State } from '@hookstate/core'
import { v4 as uuidv4 } from 'uuid'

import { PeerID, UserID } from '../types/Types'
import { ActionQueueHandle, ActionQueueInstance, ResolvedActionType, Topic } from './ActionFunctions'
import { ReactorReconciler, ReactorRoot } from './ReactorFunctions'

export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never
export interface HyperStore {
  /**
   * The topic to dispatch to when none are supplied
   */
  defaultTopic: Topic
  /**
   *  Topics that should forward their incoming actions to the outgoing queue.
   */
  forwardingTopics: Set<Topic>
  /**
   * The agent id
   */
  peerID: PeerID
  /**
   * The uuid of the logged-in user
   */
  userID: UserID
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
  stateMap: Record<string, State<any>>

  stateReactors: Record<string, ReactorRoot>

  actions: {
    /** All queues that have been created */
    queues: Map<ActionQueueHandle, ActionQueueInstance>
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
      Topic,
      {
        /** All actions that are waiting to be sent */
        queue: Array<Required<ResolvedActionType>>
        /** All actions that have been sent */
        history: Array<Required<ResolvedActionType>>
        /** All incoming action UUIDs that have been processed */
        forwardedUUIDs: Set<string>
      }
    >
  }

  receptors: Record<string, () => void>

  /** active reactors */
  activeReactors: Set<ReactorRoot>

  logger: (component: string) => {
    debug: (...message: any[]) => void
    info: (...message: any[]) => void
    warn: (...message: any[]) => void
    error: (...message: any[]) => void
    fatal: (...message: any[]) => void
  }
}

export class HyperFlux {
  static store: HyperStore
}

export function createHyperStore(options?: {
  getDispatchTime?: () => number
  defaultDispatchDelay?: () => number
  getCurrentReactorRoot?: () => ReactorRoot | undefined
}) {
  const store: HyperStore = {
    defaultTopic: 'default' as Topic,
    forwardingTopics: new Set<Topic>(),
    getDispatchTime: options?.getDispatchTime ?? (() => 0),
    defaultDispatchDelay: options?.defaultDispatchDelay ?? (() => 0),
    getCurrentReactorRoot: options?.getCurrentReactorRoot ?? (() => undefined),
    userID: '' as UserID,
    peerID: uuidv4() as PeerID,
    stateMap: {},
    stateReactors: {},
    actions: {
      queues: new Map(),
      cached: [],
      incoming: [],
      history: [],
      knownUUIDs: new Set(),
      outgoing: {}
    },
    receptors: {},
    activeReactors: new Set(),
    logger: (component: string) => ({
      debug: (...message: string[]) => console.debug(`[${component}]`, ...message),
      info: (...message: string[]) => console.info(`[${component}]`, ...message),
      warn: (...message: string[]) => console.warn(`[${component}]`, ...message),
      error: (...message: string[]) => console.error(`[${component}]`, ...message),
      fatal: (...message: string[]) => console.error(`[${component}]`, ...message)
    })
  }
  HyperFlux.store = store
  return store
}

export const disposeStore = (store = HyperFlux.store) => {
  for (const reactor of store.activeReactors) {
    ReactorReconciler.flushSync(() => reactor.stop())
  }
}
