/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { ArrowHelper, Group, Quaternion } from 'three'

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
