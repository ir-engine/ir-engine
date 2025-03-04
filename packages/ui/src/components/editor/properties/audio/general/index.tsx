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

import { getSimulationCounterpart, hasComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'

import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { GeneralAudioComponent } from '@ir-engine/engine/src/audio/components/GeneralAudioComponent'
import { PiSpeakerLowLight } from 'react-icons/pi'
import MediaInput, { MediaMode } from '../../media'

/**
 * GeneralAudioNodeEditor used to render editor view for property customization.
 */
export const GeneralAudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(props.entity)

  const audio = useComponent(simulationEntity, GeneralAudioComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
      Icon={GeneralAudioNodeEditor.iconComponent}
    >
      <MediaInput
        mediaMode={MediaMode.audio}
        entity={props.entity}
        mediaNodeId={audio.mediaUUID.value}
        OnMediaSourceUpdate={commitProperty(GeneralAudioComponent, 'mediaUUID')}
        dropTypes={[...ItemTypes.Audios]}
      />
    </NodeEditor>
  )
}

GeneralAudioNodeEditor.iconComponent = PiSpeakerLowLight

export default GeneralAudioNodeEditor
