import { store } from '../../store'
import { createState, useState } from '@hookstate/core'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'

const state = createState({
  isTeleporting: null! as ReturnType<typeof PortalComponent.get>,
  sceneLoaded: false,
  connectedWorld: false,
  joinedWorld: false,
  isInitialised: false,
  loadingProgress: -1
})

store.receptors.push((action: EngineActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ENGINE_SET_TELEPORTING':
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
      case 'ENGINE_SCENE_LOADED':
        return s.merge({ sceneLoaded: action.sceneLoaded })
      case 'ENGINE_CONNECTED_WORLD':
        return s.merge({ connectedWorld: action.connectedWorld })
      case 'ENGINE_JOINED_WORLD':
        return s.merge({ joinedWorld: action.joinedWorld })
      case 'ENGINE_SET_INITIALISED':
        return s.merge({ isInitialised: action.initialised })
      case 'ENGINE_LOADING_PROGRESS':
        return s.merge({ loadingProgress: action.count })
    }
  }, action.type)
})

export const accessEngineState = () => state

export const useEngineState = () => useState(state) as any as typeof state

export const ScenesService = {}

export const EngineAction = {
  setTeleporting: (portalComponent: ReturnType<typeof PortalComponent.get>) => {
    return {
      type: 'ENGINE_SET_TELEPORTING' as const,
      portalComponent
    }
  },
  setSceneLoaded: (sceneLoaded: boolean) => {
    return {
      type: 'ENGINE_SCENE_LOADED' as const,
      sceneLoaded
    }
  },
  setConnectedWorld: (connectedWorld: boolean) => {
    return {
      type: 'ENGINE_CONNECTED_WORLD' as const,
      connectedWorld
    }
  },
  setJoinedWorld: (joinedWorld: boolean) => {
    return {
      type: 'ENGINE_JOINED_WORLD' as const,
      joinedWorld
    }
  },
  setInitialised: (initialised: boolean) => {
    return {
      type: 'ENGINE_SET_INITIALISED' as const,
      initialised
    }
  },
  loadingProgress: (count: number) => {
    return {
      type: 'ENGINE_LOADING_PROGRESS' as const,
      count
    }
  }
}

export type EngineActionType = ReturnType<typeof EngineAction[keyof typeof EngineAction]>
