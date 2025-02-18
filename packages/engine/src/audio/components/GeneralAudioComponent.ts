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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ActiveHelperComponent } from '../../../../spatial/src/common/ActiveHelperComponent'
import { NodeFunctions } from '../../gltf/NodeFunctions'
import { NodeIDSchema } from '../../gltf/NodeIDComponent'

export const GeneralAudioComponent = defineComponent({
  name: 'EE_generalAudio',

  jsonID: 'EE_audio_general',

  schema: S.Object({
    mediaUUID: NodeIDSchema()
  }),

  onRemove: (entity, component) => {
    removeComponent(entity, MediaComponent)
  },

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const activeHelperComponent = useOptionalComponent(entity, ActiveHelperComponent)
    const debugEnabled = renderState.nodeHelperVisibility.value || activeHelperComponent !== undefined
    const audio = useComponent(entity, GeneralAudioComponent)
    const mediaUUID = audio.mediaUUID.value
    const mediaEntity = NodeFunctions.useEntityFromNodeID(entity, mediaUUID) || entity
    const media = useOptionalComponent(mediaEntity, MediaComponent)
    const hasMediaElementComponent = useHasComponent(mediaEntity, MediaElementComponent)

    const mediaElement = useOptionalComponent(mediaEntity, MediaElementComponent)

    useEffect(() => {
      setComponent(entity, MediaComponent)
    }, [])

    return null
  }
})
