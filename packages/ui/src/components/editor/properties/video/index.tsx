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
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import { ClampToEdgeWrapping, MirroredRepeatWrapping, RepeatWrapping } from 'three'

import MediaInput, { MediaMode } from '../media'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

const audioModeOptions = [
  { label: 'Positional', value: 'positional' },
  { label: 'Ambient', value: 'ambient' }
]

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

const projectionOptions = [
  { label: 'Flat', value: 'Flat' },
  { label: 'Equirectangular360', value: 'Equirectangular360' }
]

const wrappingOptions = [
  { label: 'Repeat', value: RepeatWrapping },
  { label: 'Clamp', value: ClampToEdgeWrapping },
  { label: 'Mirrored Repeat', value: MirroredRepeatWrapping }
]

/**
 * VideoNodeEditor used to render editor view for property customization.
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(props.entity)
  const video = useComponent(simulationEntity, VideoComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
      Icon={VideoNodeEditor.iconComponent}
    >
      <MediaInput
        mediaMode={MediaMode.video}
        entity={props.entity}
        mediaNodeId={video.mediaUUID.value}
        OnMediaSourceUpdate={commitProperty(VideoComponent, 'mediaUUID')}
        dropTypes={[...ItemTypes.Videos]}
      />
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
