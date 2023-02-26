import { NormalizedLandmark } from '@mediapipe/pose'
import { defineComponent, Types } from 'bitecs'
import { useEffect } from 'react'

import { matches } from '../../common/functions/MatchesUtils'
import { Entity } from '../../ecs/classes/Entity'
import { hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'

export type MotionCaptureComponentType = {
  data: NormalizedLandmark[]
}

const { f64, ui8 } = Types

export const NormalizedLandmarkSchema = {
  x: f64,
  y: f64,
  z: f64,
  visibility: f64
}

export const MotionCaptureSchema = {
  data: [] as NormalizedLandmark[]
}

export const MotionCaptureComponent = defineComponent({
  name: 'MotionCaptureComponent',
  schema: MotionCaptureSchema,
  onInit() {
    return {
      data: [{ x: 0, y: 0, z: 0, visibility: 0 }] as NormalizedLandmark[]
    }
  },
  toJSON: (entity, component) => {
    return {
      data: component?.data?.value
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    component.data = json?.data
  }
})

globalThis.MotionCaptureComponent = MotionCaptureComponent

/**
 * Sets the data component.
 * Used for objects that exist as part of the world - such as avatars and scene objects
 * @param entity
 * @param parentEntity
 * @param data
 * @returns
 */
export function setMotionCaptureData(entity: Entity, data?: []) {
  // @ts-ignore
  const mocap = useComponent(entity, MotionCaptureComponent)
  debugger
  useEffect(() => {
    mocap.value.data = data
  }, [mocap])

  return data
}

export const SCENE_COMPONENT_MOTION_CAPTURE = 'mocap'
export const SCENE_COMPONENT_MOTION_CAPTURE_DEFAULT_VALUES = {
  data: [{ x: 0, y: 0, z: 0, visibility: 0 }]
}
