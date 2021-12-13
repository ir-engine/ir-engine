import { createState, useState } from '@hookstate/core'
import { EngineEvents } from './EngineEvents'

const state = createState({
  isPhysicsDebug: false,
  isAvatarDebug: false
})

export const receptors = (): [] => {
  const ret: any = []
  ret.push(stateReceptor)
  ret.push(callbackReceptor2)
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
    }
  }, action.type)
}

function callbackReceptor2(action: EngineActionType) {
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
  resetEngine: (instance: any) => {
    return {
      type: EngineEvents.EVENTS.RESET_ENGINE,
      instance
    }
  },
  initializeEngine: () => {
    return {
      type: EngineEvents.EVENTS.INITIALIZED_ENGINE
    }
  },
  connectToWorld: (connectedClients: any, instance: boolean) => {
    return {
      type: EngineEvents.EVENTS.CONNECT_TO_WORLD,
      connectedClients,
      instance
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
  sceneLoaded: () => {
    return {
      type: EngineEvents.EVENTS.SCENE_LOADED
    }
  },
  sceneEntityLoaded: (entitiesLeft: number) => {
    return {
      type: EngineEvents.EVENTS.SCENE_ENTITY_LOADED,
      entitiesLeft
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
