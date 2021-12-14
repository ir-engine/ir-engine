import { createState, useState } from '@hookstate/core'
import { InteractionData } from '../../interaction/types/InteractionTypes'
import { PortalComponent, PortalComponentType } from '../../scene/components/PortalComponent'
import { EngineEvents } from './EngineEvents'

const state = createState({
  isInitialised: false,
  sceneLoaded: false,
  joinedWorld: false,
  loadingProgress: -1,
  connectedWorld: false,
  isTeleporting: null! as ReturnType<typeof PortalComponent.get>,

  isPhysicsDebug: false,
  isAvatarDebug: false
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

      case EngineEvents.EVENTS.INITIALIZED_ENGINE:
        return s.merge({ isInitialised: action.initialised })
      case EngineEvents.EVENTS.SCENE_LOADED:
        return s.merge({ sceneLoaded: action.sceneLoaded })
      case EngineEvents.EVENTS.JOINED_WORLD:
        return s.merge({ joinedWorld: action.joinedWorld })
      case EngineEvents.EVENTS.LOADING_PROGRESS:
        return s.merge({ loadingProgress: action.count })
      case EngineEvents.EVENTS.CONNECT_TO_WORLD:
        return s.merge({ connectedWorld: action.connectedWorld })
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
    case EngineEvents.EVENTS.RESET_ENGINE:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.RESET_ENGINE,
        instance: action.instance
      })
      break

    case EngineEvents.EVENTS.INITIALIZED_ENGINE:
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.INITIALIZED_ENGINE })
      break

    case EngineEvents.EVENTS.CONNECT_TO_WORLD:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.CONNECT_TO_WORLD,
        connectedClients: action.connectedClients,
        instance: action.instance
      })
      break

    case EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT,
        instance: action.instance
      })
      break

    case EngineEvents.EVENTS.JOINED_WORLD:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.JOINED_WORLD
      })
      break

    case EngineEvents.EVENTS.LEAVE_WORLD:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.LEAVE_WORLD
      })
      break
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
    case EngineEvents.EVENTS.WINDOW_FOCUS:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.WINDOW_FOCUS,
        focused: document.visibilityState === 'visible'
      })
      break
    case EngineEvents.EVENTS.ENTITY_DEBUG_DATA:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.ENTITY_DEBUG_DATA
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
    case EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.PORTAL_REDIRECT_EVENT,
        portalComponent: action.portalComponent
      })
      break
    case EngineEvents.EVENTS.XR_START:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.XR_START
      })
      break
    case EngineEvents.EVENTS.XR_SESSION:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.XR_SESSION
      })
      break
    case EngineEvents.EVENTS.XR_END:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.XR_END
      })
      break
    case EngineEvents.EVENTS.CONNECT:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.CONNECT,
        id: action.id
      })
      break
    case EngineEvents.EVENTS.CONNECTION_LOST:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.CONNECTION_LOST
      })
      break
    case EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS
      })
      break
    case EngineEvents.EVENTS.SUSPEND_POSITIONAL_AUDIO:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.SUSPEND_POSITIONAL_AUDIO
      })
      break
    case EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED:
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED,
        msg: action.msg
      })
      break
    case EngineEvents.EVENTS.PHYSICS_DEBUG:
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.PHYSICS_DEBUG, enabled: action.isPhysicsDebug })
      break

    case EngineEvents.EVENTS.AVATAR_DEBUG:
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.AVATAR_DEBUG, enabled: action.isAvatarDebug })
      break
  }
}

export const useEngineState = () => useState(state) as any as typeof state

export const EngineActions = {
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
  resetEngine: (instance: any) => {
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
  connectToWorld: (connectedClients: any, instance: boolean, connectedWorld: boolean) => {
    return {
      type: EngineEvents.EVENTS.CONNECT_TO_WORLD,
      connectedClients,
      instance,
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

  /////////////
  windowFocus: () => {
    return {
      type: EngineEvents.EVENTS.WINDOW_FOCUS
    }
  },
  entityDebugData: () => {
    return {
      type: EngineEvents.EVENTS.ENTITY_DEBUG_DATA
    }
  },
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
  connectionLost: () => {
    return {
      type: EngineEvents.EVENTS.CONNECTION_LOST
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
