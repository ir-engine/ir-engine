import { createState, useState } from '@speigg/hookstate'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { InteractableComponentType } from '../../interaction/components/InteractableComponent'
import { EngineEvents } from './EngineEvents'
import { Entity } from './Entity'

const state = createState({
  fixedTick: 0,
  isEngineInitialized: false,
  sceneLoading: false,
  sceneLoaded: false,
  joinedWorld: false,
  loadingProgress: 0,
  loadingDetails: 'loading background assests...',
  connectedWorld: false,
  isTeleporting: false,
  isPhysicsDebug: false,
  isAvatarDebug: false,
  leaveWorld: false,
  socketInstance: false,
  connectionTimeoutInstance: false,
  avatarTappedId: null! as UserId,
  userHasInteracted: false,
  interactionData: null! as InteractableComponentType,
  xrSupported: false,
  errorEntities: {} as { [key: Entity]: boolean }
})

export function EngineEventReceptor(action: EngineActionType) {
  state.batch((s) => {
    switch (action.type) {
      case EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED:
        break
      case EngineEvents.EVENTS.PHYSICS_DEBUG:
        return s.merge({
          isPhysicsDebug: action.isPhysicsDebug
        })
      case EngineEvents.EVENTS.AVATAR_DEBUG:
        return s.merge({
          isAvatarDebug: action.isAvatarDebug
        })

      case EngineEvents.EVENTS.RESET_ENGINE:
        return s.merge({
          socketInstance: action.instance
        })
      case EngineEvents.EVENTS.USER_AVATAR_TAPPED:
        return s.merge({
          avatarTappedId: action.userId
        })
      case EngineEvents.EVENTS.INITIALIZED_ENGINE:
        return s.merge({ isEngineInitialized: action.initialised })
      case EngineEvents.EVENTS.SCENE_UNLOADED:
        return s.merge({ sceneLoaded: false, sceneLoading: false })
      case EngineEvents.EVENTS.SCENE_LOADING:
        return s.merge({ sceneLoaded: false, sceneLoading: true })
      case EngineEvents.EVENTS.SCENE_LOADED:
        return s.merge({ sceneLoaded: true, sceneLoading: false })
      case EngineEvents.EVENTS.JOINED_WORLD:
        return s.merge({ joinedWorld: true })
      case EngineEvents.EVENTS.LEAVE_WORLD:
        return s.merge({ joinedWorld: false })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD:
        return s.merge({ connectedWorld: action.connectedWorld })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT:
        return s.merge({ connectionTimeoutInstance: action.instance })
      case EngineEvents.EVENTS.OBJECT_ACTIVATION:
        return s.merge({ interactionData: action.interactionData })
      case EngineEvents.EVENTS.SET_TELEPORTING:
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
      case EngineEvents.EVENTS.LOADING_STATE_CHANGED:
        s.loadingProgress.set(action.loadingProgress)
        s.loadingDetails.set(action.loadingDetails)
        return
      case EngineEvents.EVENTS.SET_USER_HAS_INTERACTED:
        return s.merge({ userHasInteracted: true })
      case EngineEvents.EVENTS.ENTITY_ERROR_UPDATE:
        s.errorEntities[action.entity].set(!action.isResolved)
        return
      case EngineEvents.EVENTS.XR_SUPPORTED:
        s.xrSupported.set(action.xrSupported)
        return
    }
  }, action.type)
}

export const useEngineState = () => useState(state) as any as typeof state
export const accessEngineState = () => state
export const EngineActions = {
  userAvatarTapped: (userId) => {
    return {
      type: EngineEvents.EVENTS.USER_AVATAR_TAPPED,
      userId
    }
  },
  setTeleporting: (isTeleporting: boolean) => {
    return {
      type: EngineEvents.EVENTS.SET_TELEPORTING,
      isTeleporting
    }
  },
  resetEngine: (instance: boolean) => {
    return {
      type: EngineEvents.EVENTS.RESET_ENGINE,
      instance
    }
  },
  initializeEngine: (initialised: boolean) => {
    return {
      type: EngineEvents.EVENTS.INITIALIZED_ENGINE,
      initialised
    }
  },
  connectToWorld: (connectedWorld: boolean) => {
    return {
      type: EngineEvents.EVENTS.CONNECT_TO_WORLD,
      connectedWorld
    }
  },
  connectToWorldTimeout: (instance: boolean) => {
    return {
      type: EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT,
      instance
    }
  },
  joinedWorld: () => {
    return {
      type: EngineEvents.EVENTS.JOINED_WORLD
    }
  },
  leaveWorld: () => {
    return {
      type: EngineEvents.EVENTS.LEAVE_WORLD
    }
  },
  sceneLoading: () => {
    return {
      type: EngineEvents.EVENTS.SCENE_LOADING
    }
  },
  sceneLoaded: () => {
    return {
      type: EngineEvents.EVENTS.SCENE_LOADED
    }
  },
  sceneUnloaded: () => {
    return {
      type: EngineEvents.EVENTS.SCENE_UNLOADED
    }
  },
  sceneEntityLoaded: (entitiesLeft: number) => {
    return {
      type: EngineEvents.EVENTS.SCENE_ENTITY_LOADED,
      entitiesLeft
    }
  },
  ////////////////
  enableScene: (env: any) => {
    return {
      type: EngineEvents.EVENTS.ENABLE_SCENE,
      env
    }
  },

  objectActivation: (interactionData: InteractableComponentType) => {
    return {
      type: EngineEvents.EVENTS.OBJECT_ACTIVATION,
      interactionData
    }
  },

  xrStart: () => {
    return {
      type: EngineEvents.EVENTS.XR_START
    }
  },
  xrSession: () => {
    return {
      type: EngineEvents.EVENTS.XR_SESSION
    }
  },
  xrEnd: () => {
    return {
      type: EngineEvents.EVENTS.XR_END
    }
  },
  connect: (id: any) => {
    return {
      type: EngineEvents.EVENTS.CONNECT,
      id
    }
  },
  startSuspendedContexts: () => {
    return {
      type: EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS
    }
  },
  suspendPositionalAudio: () => {
    return {
      type: EngineEvents.EVENTS.SUSPEND_POSITIONAL_AUDIO
    }
  },
  browserNotSupported: (msg: string) => {
    return {
      type: EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED,
      msg
    }
  },

  setPhysicsDebug: (isPhysicsDebug: boolean) => {
    return {
      type: EngineEvents.EVENTS.PHYSICS_DEBUG,
      isPhysicsDebug
    }
  },
  setAvatarDebug: (isAvatarDebug: boolean) => {
    return {
      type: EngineEvents.EVENTS.AVATAR_DEBUG,
      isAvatarDebug
    }
  },
  loadingStateChanged: (loadingProgress: number, loadingDetails: string) => {
    return {
      type: EngineEvents.EVENTS.LOADING_STATE_CHANGED,
      loadingProgress,
      loadingDetails
    }
  },
  setUserHasInteracted: () => {
    return {
      type: EngineEvents.EVENTS.SET_USER_HAS_INTERACTED
    }
  },
  updateEntityError: (entity: Entity, isResolved = false) => {
    return {
      type: EngineEvents.EVENTS.ENTITY_ERROR_UPDATE,
      entity,
      isResolved
    }
  },
  xrSupported: (xrSupported: boolean) => {
    return {
      type: EngineEvents.EVENTS.XR_SUPPORTED,
      xrSupported
    }
  }
}

export type EngineActionType = ReturnType<typeof EngineActions[keyof typeof EngineActions]>
