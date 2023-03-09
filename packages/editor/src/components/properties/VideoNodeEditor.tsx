import { useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  defineQuery,
  getComponent,
  useComponent,
  useQuery
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { VideoComponent } from '@etherealengine/engine/src/scene/components/VideoComponent'

import VideocamIcon from '@mui/icons-material/Videocam'

import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { Vector2Input } from '../inputs/Vector2Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @param       {any} props
 * @constructor
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const video = useComponent(props.entity, VideoComponent)

  const mediaEntities = useQuery([MediaComponent])

  const mediaOptions = mediaEntities.map((entity) => {
    return { label: getComponent(entity, NameComponent), value: getComponent(entity, UUIDComponent) }
  })
  mediaOptions.unshift({ label: 'Self', value: '' as EntityUUID })

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
    >
      <InputGroup
        name="Media"
        label={t('editor:properties.video.lbl-media')}
        info={t('editor:properties.video.lbl-media-info')}
      >
        <SelectInput
          value={video.mediaUUID.value}
          onChange={updateProperty(VideoComponent, 'mediaUUID')}
          options={mediaOptions}
          isSearchable
        />
      </InputGroup>

      <InputGroup
        name="Video Size"
        label={t('editor:properties.video.lbl-size')}
        info={t('editor:properties.video.lbl-size-info')}
      >
        <Vector2Input value={video.size.value} onChange={updateProperty(VideoComponent, 'size')} />
      </InputGroup>

      <InputGroup
        name="Video Fit"
        label={t('editor:properties.video.lbl-fit')}
        info={t('editor:properties.video.lbl-fit-info')}
      >
        <SelectInput value={video.fit.value} onChange={updateProperty(VideoComponent, 'fit')} options={fitOptions} />
      </InputGroup>
    </NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

export default VideoNodeEditor
