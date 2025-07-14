/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from './CameraOrbitComponent'

/**
 * Component for Guided (Point of Interest) camera behavior.
 * This component manages camera state specific to Guided mode navigation.
 */
export const PoiCameraComponent = defineComponent({
  name: 'PoiCameraComponent',
  jsonID: 'IR_poi_camera',

  schema: S.Object({
    // Current Guided navigation state
    currentPoiIndex: S.Number({ default: -1 }),
    targetPoiIndex: S.Number({ default: -1 }),
    poiLerpValue: S.Number({ default: 0 }),

    // Scroll accumulation for manual control
    scrollAccumulator: S.Number({ default: 0 }),

    // Transition state for snapping mode
    isTransitioning: S.Bool({ default: false })
  }),

  reactor: () => {
    const entity = useEntityContext()

    //disable orbit camera used for the editor to prevent conflicts / flickering
    useImmediateEffect(() => {
      const preexistingOrbit = hasComponent(entity, CameraOrbitComponent)
      if (preexistingOrbit) removeComponent(entity, CameraOrbitComponent)
      return () => {
        if (preexistingOrbit) setComponent(entity, CameraOrbitComponent)
      }
    }, [])
  }
})
