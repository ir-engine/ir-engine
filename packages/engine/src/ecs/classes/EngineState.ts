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

import { defineAction, defineState, getMutableState } from '@etherealengine/hyperflux'

import { matches, matchesEntity, Validator } from '../../common/functions/MatchesUtils'
import { Entity } from './Entity'

// TODO: #6016 Refactor EngineState into multiple state objects: timer, scene, world, xr, etc.
export const EngineState = defineState({
  name: 'EngineState',
  initial: () => ({
    simulationTimestep: 1000 / 60,

    frameTime: Date.now(),
    simulationTime: Date.now(),

    deltaSeconds: 0,
    elapsedSeconds: 0,

    physicsSubsteps: 1,

    isEngineInitialized: false,
    sceneLoading: false,
    sceneLoaded: false,
    joinedWorld: false,
    loadingProgress: 0,
    connectedWorld: false,
    isTeleporting: false,
    leaveWorld: false,
    socketInstance: false,
    spectating: false,
    avatarLoadingEffect: true,
    /**
     * An empty share link will default to the current URL, plus any modifiers (such as spectate mode)
     */
    shareLink: '',
    shareTitle: '',
    publicPath: '',
    transformsNeedSorting: true,
    isBot: false,
    isEditor: false,
    systemPerformanceProfilingEnabled: false
  })
})

export function EngineEventReceptor(a) {
  const s = getMutableState(EngineState)
  matches(a)
    .when(EngineActions.browserNotSupported.matches, (action) => {})
    .when(EngineActions.resetEngine.matches, (action) =>
      s.merge({
        socketInstance: action.instance
      })
    )
    .when(EngineActions.initializeEngine.matches, (action) => s.merge({ isEngineInitialized: action.initialised }))
    .when(EngineActions.sceneUnloaded.matches, (action) => s.merge({ sceneLoaded: false }))
    .when(EngineActions.sceneLoaded.matches, (action) => s.merge({ sceneLoading: false, sceneLoaded: true }))
    .when(EngineActions.joinedWorld.matches, (action) => s.merge({ joinedWorld: true }))
    .when(EngineActions.leaveWorld.matches, (action) => s.merge({ joinedWorld: false }))
    .when(EngineActions.connectToWorld.matches, (action) => s.connectedWorld.set(action.connectedWorld))
    .when(EngineActions.setTeleporting.matches, (action) => s.merge({ isTeleporting: action.isTeleporting }))
    .when(EngineActions.spectateUser.matches, (action) => s.spectating.set(!!action.user))
}

export class EngineActions {
  static setTeleporting = defineAction({
    type: 'xre.engine.Engine.SET_TELEPORTING' as const,
    isTeleporting: matches.boolean
  })

  static resetEngine = defineAction({
    type: 'xre.engine.Engine.RESET_ENGINE' as const,
    instance: matches.boolean
  })

  static initializeEngine = defineAction({
    type: 'xre.engine.Engine.INITIALIZED_ENGINE' as const,
    initialised: matches.boolean
  })

  static connectToWorld = defineAction({
    type: 'xre.engine.Engine.CONNECT_TO_WORLD' as const,
    connectedWorld: matches.boolean
  })

  static joinedWorld = defineAction({
    type: 'xre.engine.Engine.JOINED_WORLD' as const
  })

  static leaveWorld = defineAction({
    type: 'xre.engine.Engine.LEAVE_WORLD' as const
  })

  /** @deprecated */
  static sceneLoaded = defineAction({
    type: 'xre.engine.Engine.SCENE_LOADED' as const
  })

  /** @deprecated */
  static sceneUnloaded = defineAction({
    type: 'xre.engine.Engine.SCENE_UNLOADED' as const
  })

  static browserNotSupported = defineAction({
    type: 'xre.engine.Engine.BROWSER_NOT_SUPPORTED' as const,
    msg: matches.string
  })

  static setUserHasInteracted = defineAction({
    type: 'xre.engine.Engine.SET_USER_HAS_INTERACTED' as const
  })

  static setupAnimation = defineAction({
    type: 'xre.engine.Engine.SETUP_ANIMATION' as const,
    entity: matches.number
  })

  static spectateUser = defineAction({
    type: 'xre.engine.Engine.SPECTATE_USER' as const,
    user: matches.string.optional()
  })

  static exitSpectate = defineAction({
    type: 'xre.engine.Engine.EXIT_SPECTATE' as const
  })

  static avatarAlreadyInWorld = defineAction({
    type: 'xre.world.AVATAR_ALREADY_IN_WORLD'
  })

  static interactedWithObject = defineAction({
    type: 'xre.engine.Engine.INTERACTED_WITH_OBJECT' as const,
    targetEntity: matchesEntity.optional(),
    handedness: matches.string as Validator<unknown, XRHandedness>
  })

  /**
   * Dispatched whenever an otherwise unchanging scene object has it's properties changed,
   *   such as making changes from the editor.
   * @deprecated
   **/
  static sceneObjectUpdate = defineAction({
    type: 'xre.engine.Engine.SCENE_OBJECT_UPDATE' as const,
    entities: matches.any as Validator<unknown, Entity[]>
  })

  static avatarModelChanged = defineAction({
    type: 'xre.engine.Engine.AVATAR_MODEL_CHANGED' as const,
    entity: matchesEntity
  })
}
