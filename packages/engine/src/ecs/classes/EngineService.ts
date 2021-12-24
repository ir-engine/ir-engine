import { createState, useState } from '@hookstate/core'
import { InteractionData } from '../../interaction/types/InteractionTypes'
import { PortalComponent, PortalComponentType } from '../../scene/components/PortalComponent'
import { EngineEvents } from './EngineEvents'

const state = createState({
  isEngineInitialized: false,
  sceneLoaded: false,
  joinedWorld: false,
  loadingProgress: -1,
  connectedWorld: false,
  isTeleporting: null! as ReturnType<typeof PortalComponent.get>,

  isPhysicsDebug: false,
  isAvatarDebug: false,
  leaveWorld: false,
  socketInstance: false,
  connectionTimeoutInstance: false,
  avatarTappedId: null! as string
})

export const receptors = (): [] => {
  const ret: any = []
  ret.push(stateReceptor)
  ret.push(callbackReceptor)
  return ret
}
function stateReceptor(action: EngineActionType) {
  state.batch((s) => {
    switch (action.type) {
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
      case EngineEvents.EVENTS.LOADING_PROGRESS:
        return s.merge({ loadingProgress: action.count })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD:
        return s.merge({ connectedWorld: action.connectedWorld })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT:
        return s.merge({ connectionTimeoutInstance: action.instance })
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
    }
  }, action.type)
}

function callbackReceptor(action: EngineActionType) {
  switch (action.type) {
    case EngineEvents.EVENTS.SCENE_LOADED:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.SCENE_LOADED
      })
      break
    case EngineEvents.EVENTS.SCENE_ENTITY_LOADED:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.SCENE_ENTITY_LOADED,
        entitiesLeft: action.entitiesLeft
      })
      break
    case EngineEvents.EVENTS.ENABLE_SCENE:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.ENABLE_SCENE,
        renderer: action.env.renderer,
        physics: action.env.physics
      })
      break

    case EngineEvents.EVENTS.OBJECT_HOVER:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.OBJECT_HOVER,
        ...action.props
      })
      break
    case EngineEvents.EVENTS.OBJECT_ACTIVATION:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.OBJECT_ACTIVATION,
        interaction: action.interactionData
      })
      break
    case EngineEvents.EVENTS.CONNECT:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.CONNECT,
        id: action.id
      })
      break
    case EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED,
        msg: action.msg
      })
      break
  }
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

  loadingProgress: (count: number) => {
    return {
      type: EngineEvents.EVENTS.LOADING_PROGRESS,
      count
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

  ////////////
  objectHover: (props: {}) => {
    return {
      type: EngineEvents.EVENTS.OBJECT_HOVER,
      props
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
  }
}
export type EngineActionType = ReturnType<typeof EngineActions[keyof typeof EngineActions]>
