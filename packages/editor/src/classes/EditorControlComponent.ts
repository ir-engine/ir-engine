import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  SnapModeType,
  TransformModeType,
  TransformPivotType,
  TransformSpace
} from '@xrengine/engine/src/scene/constants/transformConstants'
import { Vector2 } from 'three'

export type EditorControlComponentType = {
  enable: boolean
  transformMode: TransformModeType
  transformPivot: TransformPivotType
  transformSpace: TransformSpace
  dragging?: boolean

  selectStartPosition: Vector2

  selectionChanged?: boolean
  transformModeChanged?: boolean
  transformPivotChanged?: boolean
  transformSpaceChanged?: boolean
  transformPropertyChanged?: boolean

  translationSnap: number
  rotationSnap: number
  scaleSnap: number

  snapMode: SnapModeType

  transformModeOnCancel: TransformModeType
  multiplePlacement?: boolean
  grabHistoryCheckpoint?: Entity
}

export const EditorControlComponent = createMappedComponent<EditorControlComponentType>('FlyControlComponent')
