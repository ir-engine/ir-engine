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

import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { getMutableState, getState } from '@ir-engine/hyperflux'

const DistanceModelTypeSchema = S.LiteralUnion(['exponential', 'inverse', 'linear'], { default: 'linear' })

export const MediaSettingsComponent = defineComponent({
  name: 'MediaSettingsComponent',
  jsonID: 'EE_media_settings',

  schema: S.Object({
    immersiveMedia: S.Bool(),
    refDistance: S.Number({ default: 20 }),
    rolloffFactor: S.Number({ default: 1 }),
    maxDistance: S.Number({ default: 10000 }),
    distanceModel: DistanceModelTypeSchema,
    coneInnerAngle: S.Number({ default: 360 }),
    coneOuterAngle: S.Number(),
    coneOuterGain: S.Number()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MediaSettingsComponent)

    for (const prop of Object.keys(getState(MediaSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== getState(MediaSettingsState)[prop])
          getMutableState(MediaSettingsState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
