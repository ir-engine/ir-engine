import { useEffect } from 'react'
import { ArrowHelper, Group, Quaternion } from 'three'

import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'

import { matches } from '../../common/functions/MatchesUtils'
import {
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { SplineComponent } from './SplineComponent'

export const CameraTrackComponent = defineComponent({
  name: 'CameraTrackComponent',

  onInit: (entity) => {
    const helper = new Group()
    helper.name = `camera-track-helper-${entity}`
    setObjectLayers(helper, ObjectLayers.NodeHelper)
    addObjectToGroup(entity, helper)
    return {
      pointRotations: [] as Quaternion[],
      helper,
      /** alpha defines how far along the spline the camera is at the current frame */
      alpha: 0,
      /** velocity defines in units per second how fast the camera moves */
      /** @todo */
      velocity: 1,
      disableRoll: true
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (matches.array.test(json.pointRotations))
      component.pointRotations.set(json.pointRotations.map((quat) => new Quaternion().copy(quat)))
  },

  toJSON: (entity, component) => {
    return {
      pointRotations: component.helper.value.children.map((obj) => obj.quaternion)
    }
  },

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.helper.value)
  },

  reactor: function (props) {
    const entity = props.root.entity
    if (!hasComponent(entity, CameraTrackComponent)) throw props.root.stop()

    const cameraTrack = useComponent(entity, CameraTrackComponent)
    const spline = useOptionalComponent(entity, SplineComponent)

    useEffect(() => {
      if (!spline) return
      const currentPoints = cameraTrack.helper.value.children.length
      const newPoints = spline.splinePositions.value.length

      for (let i = currentPoints; i < newPoints; i++) {
        const helper = new ArrowHelper()
        cameraTrack.helper.value.add(helper)
      }

      for (let i = currentPoints; i > newPoints; i--) {
        cameraTrack.helper.value.children[i].removeFromParent()
      }

      for (let i = 0; i < cameraTrack.helper.value.children.length; i++) {
        const child = cameraTrack.helper.value.children[i]
        child.position.copy(spline.splinePositions.value[i])
        child.quaternion.copy(cameraTrack.pointRotations.value[i])
        child.updateMatrixWorld(true)
      }
    }, [spline?.splinePositions])

    return null
  }
})

export const SCENE_COMPONENT_CAMERA_TRACK = 'camera-track'
