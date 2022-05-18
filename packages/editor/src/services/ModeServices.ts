import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'
import {
  SnapMode,
  SnapModeType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@xrengine/engine/src/scene/constants/transformConstants'

import { RenderModes, RenderModesType } from '../constants/RenderModes'

type ModeServiceStateType = {
  renderMode: RenderModesType
  isPlayModeEnabled: boolean
  isFlyModeEnabled: boolean
  transformMode: TransformModeType
  transformModeOnCancel: TransformModeType
  transformPivot: TransformPivotType
  transformSpace: TransformSpace
  snapMode: SnapModeType
  translationSnap: number
  rotationSnap: number
  scaleSnap: number
}

const state = createState<ModeServiceStateType>({
  renderMode: RenderModes.SHADOW,
  isPlayModeEnabled: false,
  isFlyModeEnabled: false,
  transformMode: TransformMode.Translate,
  transformModeOnCancel: TransformMode.Translate,
  transformSpace: TransformSpace.World,
  transformPivot: TransformPivot.Selection,
  snapMode: SnapMode.Grid,
  translationSnap: 0.5,
  rotationSnap: 10,
  scaleSnap: 0.1
})

store.receptors.push((action: ModeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'RENDER_MODE_CHANGED':
        return s.merge({ renderMode: action.renderMode })
      case 'PLAY_MODE_CHANGED':
        return s.merge({ isPlayModeEnabled: action.isPlayModeEnabled })
      case 'FLY_MODE_CHANGED':
        return s.merge({ isFlyModeEnabled: action.isFlyModeEnabled })
      case 'TRANSFORM_MODE_CHANGED':
        return s.merge({ transformMode: action.mode })
      case 'TRANSFORM_MODE_ON_CANCEL_CHANGED':
        return s.merge({ transformModeOnCancel: action.mode })
      case 'TRANSFORM_SPACE_CHANGED':
        return s.merge({ transformSpace: action.transformSpace })
      case 'TRANSFORM_PIVOT_CHANGED':
        return s.merge({ transformPivot: action.transformPivot })
      case 'SNAP_MODE_CHANGED':
        return s.merge({ snapMode: action.snapMode })
      case 'TRANSLATION_SNAP_CHANGED':
        return s.merge({ translationSnap: action.translationSnap })
      case 'ROTATION_SNAP_CHANGED':
        return s.merge({ rotationSnap: action.rotationSnap })
      case 'SCALE_SNAP_CHANGED':
        return s.merge({ scaleSnap: action.scaleSnap })
    }
  }, action.type)
})

export const accessModeState = () => state

export const useModeState = () => useState(state) as any as typeof state

//Service
export const ModeService = {}

//Action
export const ModeAction = {
  changedRenderMode: (renderMode: RenderModesType) => {
    return {
      type: 'RENDER_MODE_CHANGED' as const,
      renderMode
    }
  },
  changedPlayMode: (isEnabled: boolean) => {
    return {
      type: 'PLAY_MODE_CHANGED' as const,
      isPlayModeEnabled: isEnabled
    }
  },
  changedFlyMode: (isEnabled: boolean) => {
    return {
      type: 'FLY_MODE_CHANGED' as const,
      isFlyModeEnabled: isEnabled
    }
  },
  changedTransformMode: (mode: TransformModeType) => {
    return {
      type: 'TRANSFORM_MODE_CHANGED' as const,
      mode
    }
  },
  changeTransformModeOnCancel: (mode: TransformModeType) => {
    return {
      type: 'TRANSFORM_MODE_ON_CANCEL_CHANGED' as const,
      mode
    }
  },
  changedTransformSpaceMode: (transformSpace: TransformSpace) => {
    return {
      type: 'TRANSFORM_SPACE_CHANGED' as const,
      transformSpace
    }
  },
  changedTransformPivotMode: (transformPivot: TransformPivotType) => {
    return {
      type: 'TRANSFORM_PIVOT_CHANGED' as const,
      transformPivot
    }
  },
  changedSnapMode: (snapMode: SnapModeType) => {
    return {
      type: 'SNAP_MODE_CHANGED' as const,
      snapMode
    }
  },
  changeTranslationSnap: (translationSnap: number) => {
    return {
      type: 'TRANSLATION_SNAP_CHANGED' as const,
      translationSnap
    }
  },
  changeRotationSnap: (rotationSnap: number) => {
    return {
      type: 'ROTATION_SNAP_CHANGED' as const,
      rotationSnap
    }
  },
  changeScaleSnap: (scaleSnap: number) => {
    return {
      type: 'SCALE_SNAP_CHANGED' as const,
      scaleSnap
    }
  }
}

export type ModeActionType = ReturnType<typeof ModeAction[keyof typeof ModeAction]>
