import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

type ModeServiceStateType = {
  renderModeChanged: boolean
  playModeChanged: boolean
  flyModeChanged: boolean
  transformMode: string
  transformSpaceModeChanged: boolean
  transformPivotModeChanged: boolean
  snapSettingsChanged: boolean
}

const state = createState<ModeServiceStateType>({
  renderModeChanged: false,
  playModeChanged: false,
  flyModeChanged: false,
  transformMode: '',
  transformSpaceModeChanged: false,
  transformPivotModeChanged: false,
  snapSettingsChanged: false
})

store.receptors.push((action: ModeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'RENDER_MODE_CHANGED':
        return s.merge({ renderModeChanged: action.renderModeChanged })
      case 'PLAY_MODE_CHANGED':
        return s.merge({ playModeChanged: action.playModeChanged })
      case 'FLY_MODE_CHANGED':
        return s.merge({ flyModeChanged: action.flyModeChanged })
      case 'TRANSFORM_MODE_CHANGED':
        return s.merge({ transformMode: action.mode })
      case 'TRANSFORM_SPACE_CHANGED':
        return s.merge({ transformSpaceModeChanged: action.transformSpaceModeChanged })
      case 'TRANSFORM_PIVOT_CHANGED':
        return s.merge({ transformPivotModeChanged: action.transformPivotModeChanged })
      case 'SNAP_SETTINGS_CHANGED':
        return s.merge({ snapSettingsChanged: action.snapSettingsChanged })
    }
  }, action.type)
})

export const accessModeState = () => state

export const useModeState = () => useState(state) as any as typeof state

//Service
export const ModeService = {}

//Action
export const ModeAction = {
  changedRenderMode: () => {
    return {
      type: 'RENDER_MODE_CHANGED' as const,
      renderModeChanged: !accessModeState().renderModeChanged.value
    }
  },
  changedPlayMode: () => {
    return {
      type: 'PLAY_MODE_CHANGED' as const,
      playModeChanged: !accessModeState().playModeChanged.value
    }
  },
  changedFlyMode: () => {
    return {
      type: 'FLY_MODE_CHANGED' as const,
      flyModeChanged: !accessModeState().flyModeChanged.value
    }
  },
  changedTransformMode: (mode: string) => {
    return {
      type: 'TRANSFORM_MODE_CHANGED' as const,
      mode
    }
  },
  changedTransformSpaceMode: () => {
    return {
      type: 'TRANSFORM_SPACE_CHANGED' as const,
      transformSpaceModeChanged: !accessModeState().transformSpaceModeChanged.value
    }
  },
  changedTransformPivotMode: () => {
    return {
      type: 'TRANSFORM_PIVOT_CHANGED' as const,
      transformPivotModeChanged: !accessModeState().transformPivotModeChanged.value
    }
  },
  changedSnapSettings: () => {
    return {
      type: 'SNAP_SETTINGS_CHANGED' as const,
      snapSettingsChanged: !accessModeState().snapSettingsChanged.value
    }
  }
}

export type ModeActionType = ReturnType<typeof ModeAction[keyof typeof ModeAction]>
