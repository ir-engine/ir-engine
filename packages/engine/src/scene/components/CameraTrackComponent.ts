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

import { defineComponent, useOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { SplineComponent } from './SplineComponent'
//import { EditorHelperState } from '@etherealengine/editor/src/services/EditorHelperState'

export const CameraTrackComponent = defineComponent({
  name: 'CameraTrackComponent',
  jsonID: 'camera-track',

  onInit: (entity) => {
    return {
      /** alpha defines how far along the spline the camera is at the current frame -> the value ranges from 0 to the number of points */
      alpha: 0,
      /** velocity defines in units per second how fast the camera moves */
      /** @todo */
      velocity: 1,
      disableRoll: true
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
  },

  toJSON: (entity, component) => {
    return {}
  },

  onRemove: (entity, component) => {},

  reactor: function (props) {
    const entity = useEntityContext()
    const splineComponent = useOptionalComponent(entity, SplineComponent)?.value

    /*
    useExecute(() => {

      // @todo fix
      // const editorHelperState = getState(EditorHelperState)
      // if( editorHelperState.isPlayModeEnabled ) return;

      const cameraTrackComponent = getComponent(entity, CameraTrackComponent)

      const transform = getComponent(entity, TransformComponent)
    
      cameraTrackComponent.alpha += deltaSeconds * 0.1 // @todo improve
      const alphaIndex = Math.floor(cameraTrackComponent.alpha)
    
      // test - the SplineComponent and CameraTrackComponent don't actually use or set the facade copies of the position and orientation
      // @todo expose the private state
      if( alphaIndex >= spline._splineHelperObjects.length-1) {
        cameraTrackComponent.alpha = 0
        return
      }
      const currentPosition = spline._splineHelperObjects[alphaIndex].position
      const nextPosition = spline._splineHelperObjects[alphaIndex+1].position
      const currentRotation = spline._splineHelperObjects[alphaIndex].rotation
      const nextRotation = spline._splineHelperObjects[alphaIndex+1].rotation
    
      // @todo replace naive lerp with a spline division based calculation 
    
      cameraTransform.position.lerpVectors(currentPosition, nextPosition, cameraTrackComponent.alpha - alphaIndex).add(transform.position).y -= 1
      const l = new Quaternion().slerpQuaternions(currentRotation, nextRotation, cameraTrackComponent.alpha - alphaIndex)
      cameraTransform.rotation.copy(l) //.multiply(transform.rotation)
  
      // do useful things
    }, { with:PresentationSystemGroup } )
    */

    return null
  }
})
