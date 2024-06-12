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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { getComponent, hasComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'

import { useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import InputGroup from '../../input/Group'
import ProgressBar from '../../input/Progress'
import SelectInput from '../../input/Select'
import Vector2Input from '../../input/Vector2'
import NodeEditor from '../nodeEditor'

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

/**
 * VideoNodeEditor used to render editor view for property customization.
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const video = useComponent(props.entity, VideoComponent)

  const mediaEntities = useQuery([MediaComponent])

  const mediaOptions = mediaEntities
    .filter((entity) => entity !== props.entity)
    .map((entity) => {
      return { label: getComponent(entity, NameComponent), value: getComponent(entity, UUIDComponent) }
    })
  mediaOptions.unshift({ label: 'Self', value: '' as EntityUUID })

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
      icon={<VideoNodeEditor.iconComponent />}
    >
      <ProgressBar value={5} paused={false} totalTime={100} />
      <InputGroup
        name="Media"
        label={t('editor:properties.video.lbl-media')}
        info={t('editor:properties.video.lbl-media-info')}
      >
        <SelectInput
          value={video.mediaUUID.value}
          onChange={commitProperty(VideoComponent, 'mediaUUID')}
          options={mediaOptions}
        />
      </InputGroup>

      <InputGroup
        name="Video Size"
        label={t('editor:properties.video.lbl-size')}
        info={t('editor:properties.video.lbl-size-info')}
      >
        <Vector2Input
          value={video.size.value}
          onChange={updateProperty(VideoComponent, 'size')}
          onRelease={commitProperty(VideoComponent, 'size')}
        />
      </InputGroup>

      <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
        <SelectInput
          value={video.projection.value}
          onChange={commitProperty(VideoComponent, 'projection')}
          options={projectionOptions}
        />
      </InputGroup>

      <InputGroup
        name="Video Fit"
        label={t('editor:properties.video.lbl-fit')}
        info={t('editor:properties.video.lbl-fit-info')}
      >
        <SelectInput value={video.fit.value} onChange={commitProperty(VideoComponent, 'fit')} options={fitOptions} />
      </InputGroup>
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
