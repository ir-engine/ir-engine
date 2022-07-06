import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

import { matches, matchesUserId, Validator } from '../../common/functions/MatchesUtils'
import { InteractableComponentType } from '../../interaction/components/InteractableComponent'
import { Entity } from './Entity'

// TODO: #6016 Refactor EngineState into multiple state objects: timer, scene, world, xr, etc.
export const EngineState = defineState({
  name: 'engine',
  initial: {
    fixedTick: 0,
    isEngineInitialized: false,
    sceneLoaded: false,
    joinedWorld: false,
    loadingProgress: 0,
    connectedWorld: false,
    isTeleporting: false,
    leaveWorld: false,
    socketInstance: false,
    avatarTappedId: '' as UserId,
    userHasInteracted: false,
    interactionData: null! as InteractableComponentType,
    xrSupported: false,
    xrSessionStarted: false,
    spectating: false,
    errorEntities: {} as { [key: Entity]: boolean },
    availableInteractable: null! as Entity,
    usersTyping: {} as { [key: string]: true }
  }
})

export function EngineEventReceptor(a) {
  getState(EngineState).batch((s) => {
    matches(a)
      .when(EngineActions.browserNotSupported.matches, (action) => {})
      .when(EngineActions.resetEngine.matches, (action) =>
        s.merge({
          socketInstance: action.instance
        })
      )
      .when(EngineActions.userAvatarTapped.matches, (action) =>
        s.merge({
          avatarTappedId: action.userId
        })
      )
      .when(EngineActions.initializeEngine.matches, (action) => s.merge({ isEngineInitialized: action.initialised }))
      .when(EngineActions.sceneUnloaded.matches, (action) => s.merge({ sceneLoaded: false }))
      .when(EngineActions.sceneLoaded.matches, (action) => s.merge({ sceneLoaded: true, loadingProgress: 100 }))
      .when(EngineActions.joinedWorld.matches, (action) => {
        s.merge({ joinedWorld: true })
      })
      .when(EngineActions.sceneLoadingProgress.matches, (action) => s.merge({ loadingProgress: action.progress }))
      .when(EngineActions.leaveWorld.matches, (action) => s.merge({ joinedWorld: false }))
      .when(EngineActions.connectToWorld.matches, (action) => s.merge({ connectedWorld: action.connectedWorld }))
      .when(EngineActions.objectActivation.matches, (action) => s.merge({ interactionData: action.interactionData }))
      .when(EngineActions.setTeleporting.matches, (action) => {
        if (action.isTeleporting) {
          s.merge({
            connectedWorld: false,
            sceneLoaded: false,
            joinedWorld: false
          })
        }
        return s.merge({
          isTeleporting: action.isTeleporting
        })
      })
      .when(EngineActions.setUserHasInteracted.matches, (action) => s.merge({ userHasInteracted: true }))
      .when(EngineActions.updateEntityError.matches, (action) => s.errorEntities[action.entity].set(!action.isResolved))
      .when(EngineActions.xrSupported.matches, (action) => s.xrSupported.set(action.xrSupported))
      .when(EngineActions.xrStart.matches, (action) => s.xrSessionStarted.set(true))
      .when(EngineActions.xrSession.matches, (action) => s.xrSessionStarted.set(true))
      .when(EngineActions.xrEnd.matches, (action) => s.xrSessionStarted.set(false))
      .when(EngineActions.availableInteractable.matches, (action) =>
        s.availableInteractable.set(action.availableInteractable)
      )
      .when(EngineActions.spectateUser.matches, (action) => s.spectating.set(!!action.user))
  })
}

export const getEngineState = () => getState(EngineState)

export const useEngineState = () => useState(getEngineState())

export class EngineActions {
  static userAvatarTapped = defineAction({
    type: 'xre.engine.USER_AVATAR_TAPPED' as const,
    userId: matchesUserId
  })

  static setTeleporting = defineAction({
    type: 'xre.engine.SET_TELEPORTING' as const,
    isTeleporting: matches.boolean
  })

  static resetEngine = defineAction({
    type: 'xre.engine.RESET_ENGINE' as const,
    instance: matches.boolean
  })

  static initializeEngine = defineAction({
    type: 'xre.engine.INITIALIZED_ENGINE' as const,
    initialised: matches.boolean
  })

  static connectToWorld = defineAction({
    type: 'xre.engine.CONNECT_TO_WORLD' as const,
    connectedWorld: matches.boolean
  })

  static joinedWorld = defineAction({
    type: 'xre.engine.JOINED_WORLD' as const
  })

  static leaveWorld = defineAction({
    type: 'xre.engine.LEAVE_WORLD' as const
  })

  static sceneLoaded = defineAction({
    type: 'xre.engine.SCENE_LOADED' as const
  })

  static sceneUnloaded = defineAction({
    type: 'xre.engine.SCENE_UNLOADED' as const
  })

  static sceneLoadingProgress = defineAction({
    type: 'xre.engine.SCENE_LOADING_PROGRESS' as const,
    progress: matches.number
  })

  static objectActivation = defineAction({
    type: 'xre.engine.OBJECT_ACTIVATION' as const,
    interactionData: matches.any as Validator<unknown, InteractableComponentType>
  })

  static availableInteractable = defineAction({
    type: 'xre.engine.AVAILABLE_INTERACTABLE' as const,
    availableInteractable: matches.any
  })

  static xrStart = defineAction({
    type: 'xre.engine.XR_START' as const
  })

  static xrSession = defineAction({
    type: 'xre.engine.XR_SESSION' as const
  })

  static xrEnd = defineAction({
    type: 'xre.engine.XR_END' as const
  })

  static connect = defineAction({
    type: 'xre.engine.CONNECT' as const,
    id: matches.string
  })

  static startSuspendedContexts = defineAction({
    type: 'xre.engine.START_SUSPENDED_CONTEXTS' as const
  })

  static suspendPositionalAudio = defineAction({
    type: 'xre.engine.SUSPEND_POSITIONAL_AUDIO' as const
  })

  static browserNotSupported = defineAction({
    type: 'xre.engine.BROWSER_NOT_SUPPORTED' as const,
    msg: matches.string
  })

  static setUserHasInteracted = defineAction({
    type: 'xre.engine.SET_USER_HAS_INTERACTED' as const
  })

  static updateEntityError = defineAction({
    type: 'xre.engine.ENTITY_ERROR_UPDATE' as const,
    entity: matches.number as Validator<unknown, Entity>,
    isResolved: matches.boolean.optional()
  })

  static xrSupported = defineAction({
    type: 'xre.engine.XR_SUPPORTED' as const,
    xrSupported: matches.boolean
  })

  static setupAnimation = defineAction({
    type: 'xre.engine.SETUP_ANIMATION' as const,
    entity: matches.number
  })

  static spectateUser = defineAction({
    type: 'xre.engine.SPECTATE_USER' as const,
    user: matches.string.optional()
  })
}
