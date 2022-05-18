import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

import { matches, matchesUserId, Validator } from '../../common/functions/MatchesUtils'
import { InteractableComponentType } from '../../interaction/components/InteractableComponent'
import { Engine } from './Engine'
import { Entity } from './Entity'

// TODO: #6016 Refactor EngineState into multiple state objects: timer, scene, world, xr, etc.
export const EngineState = defineState({
  store: 'ENGINE',
  name: 'engine',
  initial: {
    fixedTick: 0,
    isEngineInitialized: false,
    sceneLoading: false,
    sceneLoaded: false,
    joinedWorld: false,
    loadingProgress: 0,
    connectedWorld: false,
    isTeleporting: false,
    leaveWorld: false,
    socketInstance: false,
    connectionTimeoutInstance: false,
    avatarTappedId: '' as UserId,
    userHasInteracted: false,
    interactionData: null! as InteractableComponentType,
    xrSupported: false,
    errorEntities: {} as { [key: Entity]: boolean }
  }
})

export function EngineEventReceptor(a: EngineActionType) {
  const s = getEngineState()
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
    .when(EngineActions.sceneUnloaded.matches, (action) => s.merge({ sceneLoaded: false, sceneLoading: false }))
    .when(EngineActions.sceneLoading.matches, (action) =>
      s.merge({ sceneLoaded: false, sceneLoading: true, loadingProgress: 0 })
    )
    .when(EngineActions.sceneLoaded.matches, (action) =>
      s.merge({ sceneLoaded: true, sceneLoading: false, loadingProgress: 100 })
    )
    .when(EngineActions.joinedWorld.matches, (action) => {
      s.merge({ joinedWorld: true })
      // if (s.sceneLoaded.value) {
      //   s.merge({ loadingProgress: 100 })
      // }
    })
    .when(EngineActions.sceneLoadingProgress.matches, (action) => s.merge({ loadingProgress: action.progress }))
    .when(EngineActions.leaveWorld.matches, (action) => s.merge({ joinedWorld: false }))
    .when(EngineActions.connectToWorld.matches, (action) => s.merge({ connectedWorld: action.connectedWorld }))
    .when(EngineActions.connectToWorldTimeout.matches, (action) =>
      s.merge({ connectionTimeoutInstance: action.instance })
    )
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
}

export const getEngineState = () => getState(Engine.instance.store, EngineState)

export const useEngineState = () => useState(getEngineState())

export const EngineActions = {
  userAvatarTapped: defineAction({
    store: 'ENGINE',
    type: 'CORE_USER_AVATAR_TAPPED' as const,
    userId: matchesUserId
  }),

  setTeleporting: defineAction({
    store: 'ENGINE',
    type: 'CORE_SET_TELEPORTING' as const,
    isTeleporting: matches.boolean
  }),

  resetEngine: defineAction({
    store: 'ENGINE',
    type: 'CORE_RESET_ENGINE' as const,
    instance: matches.boolean
  }),

  initializeEngine: defineAction({
    store: 'ENGINE',
    type: 'CORE_INITIALIZED_ENGINE' as const,
    initialised: matches.boolean
  }),

  connectToWorld: defineAction({
    store: 'ENGINE',
    type: 'CORE_CONNECT_TO_WORLD' as const,
    connectedWorld: matches.boolean
  }),

  connectToWorldTimeout: defineAction({
    store: 'ENGINE',
    type: 'CORE_CONNECT_TO_WORLD_TIMEOUT' as const,
    instance: matches.boolean
  }),

  joinedWorld: defineAction({
    store: 'ENGINE',
    type: 'CORE_JOINED_WORLD' as const
  }),

  leaveWorld: defineAction({
    store: 'ENGINE',
    type: 'CORE_LEAVE_WORLD' as const
  }),

  sceneLoading: defineAction({
    store: 'ENGINE',
    type: 'CORE_SCENE_LOADING' as const
  }),

  sceneLoaded: defineAction({
    store: 'ENGINE',
    type: 'CORE_SCENE_LOADED' as const
  }),

  sceneUnloaded: defineAction({
    store: 'ENGINE',
    type: 'CORE_SCENE_UNLOADED' as const
  }),

  sceneLoadingProgress: defineAction({
    store: 'ENGINE',
    type: 'CORE_SCENE_LOADING_PROGRESS' as const,
    progress: matches.number
  }),

  objectActivation: defineAction({
    store: 'ENGINE',
    type: 'CORE_OBJECT_ACTIVATION' as const,
    interactionData: matches.any as Validator<unknown, InteractableComponentType>
  }),

  xrStart: defineAction({
    store: 'ENGINE',
    type: 'CORE_XR_START' as const
  }),

  xrSession: defineAction({
    store: 'ENGINE',
    type: 'CORE_XR_SESSION' as const
  }),

  xrEnd: defineAction({
    store: 'ENGINE',
    type: 'CORE_XR_END' as const
  }),

  connect: defineAction({
    store: 'ENGINE',
    type: 'CORE_CONNECT' as const,
    id: matches.string
  }),

  startSuspendedContexts: defineAction({
    store: 'ENGINE',
    type: 'CORE_START_SUSPENDED_CONTEXTS' as const
  }),

  suspendPositionalAudio: defineAction({
    store: 'ENGINE',
    type: 'CORE_SUSPEND_POSITIONAL_AUDIO' as const
  }),

  browserNotSupported: defineAction({
    store: 'ENGINE',
    type: 'CORE_BROWSER_NOT_SUPPORTED' as const,
    msg: matches.string
  }),

  setUserHasInteracted: defineAction({
    store: 'ENGINE',
    type: 'CORE_SET_USER_HAS_INTERACTED' as const
  }),

  updateEntityError: defineAction({
    store: 'ENGINE',
    type: 'CORE_ENTITY_ERROR_UPDATE' as const,
    entity: matches.number as Validator<unknown, Entity>,
    isResolved: matches.boolean.optional()
  }),

  xrSupported: defineAction({
    store: 'ENGINE',
    type: 'CORE_XR_SUPPORTED' as const,
    xrSupported: matches.boolean
  }),

  setupAnimation: defineAction({
    store: 'ENGINE',
    type: 'network.SETUP_ANIMATION' as const,
    entity: matches.number
  })
}

export type EngineActionType = ReturnType<typeof EngineActions[keyof typeof EngineActions]>
