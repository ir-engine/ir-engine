import { createState, useState } from '@hookstate/core'
import { InteractionData } from '../../interaction/types/InteractionTypes'
import { PortalComponent, PortalComponentType } from '../../scene/components/PortalComponent'
import { EngineEvents } from './EngineEvents'

const state = createState({
  isEngineInitialized: false,
  sceneLoaded: false,
  joinedWorld: false,
  loadingProgress: 0,
  loadingDetails: 'loading background assests...',
  connectedWorld: false,
  isTeleporting: null! as ReturnType<typeof PortalComponent.get>,
  isPhysicsDebug: false,
  isAvatarDebug: false,
  leaveWorld: false,
  socketInstance: false,
  connectionTimeoutInstance: false,
  avatarTappedId: null! as string,
  interactionData: null! as InteractionData
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
      case EngineEvents.EVENTS.SCENE_LOADED:
        return s.merge({ sceneLoaded: action.sceneLoaded })
      case EngineEvents.EVENTS.JOINED_WORLD:
        return s.merge({ joinedWorld: action.joinedWorld })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD:
        return s.merge({ connectedWorld: action.connectedWorld })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT:
        return s.merge({ connectionTimeoutInstance: action.instance })
      case EngineEvents.EVENTS.OBJECT_ACTIVATION:
        return s.merge({ interactionData: action.interactionData })
      case EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT:
        return s.merge({
          isTeleporting: action.portalComponent
        })
      case EngineEvents.EVENTS.SET_TELEPORTING:
        if (action.portalComponent) {
          s.merge({
            connectedWorld: false,
            sceneLoaded: false,
            joinedWorld: false
          })
        }
        return s.merge({
          isTeleporting: action.portalComponent
        })
      case EngineEvents.EVENTS.LOADING_STATE_CHANGED:
        s.loadingProgress.set(action.loadingProgress)
        s.loadingDetails.set(action.loadingDetails)
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
  setTeleporting: (portalComponent: ReturnType<typeof PortalComponent.get>) => {
    return {
      type: EngineEvents.EVENTS.SET_TELEPORTING,
      portalComponent
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
  joinedWorld: (joinedWorld: boolean) => {
    return {
      type: EngineEvents.EVENTS.JOINED_WORLD,
      joinedWorld
    }
  },
  leaveWorld: () => {
    return {
      type: EngineEvents.EVENTS.LEAVE_WORLD
    }
  },
  sceneLoaded: (sceneLoaded: boolean) => {
    return {
      type: EngineEvents.EVENTS.SCENE_LOADED,
      sceneLoaded
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

  objectActivation: (interactionData: InteractionData) => {
    return {
      type: EngineEvents.EVENTS.OBJECT_ACTIVATION,
      interactionData
    }
  },
  portalRedirectEvent: (portalComponent: PortalComponentType) => {
    return {
      type: EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT,
      portalComponent
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
  }
}
export type EngineActionType = ReturnType<typeof EngineActions[keyof typeof EngineActions]>
