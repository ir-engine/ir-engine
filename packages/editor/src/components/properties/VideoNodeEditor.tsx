import { useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent, useQuery } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'

import VideocamIcon from '@mui/icons-material/Videocam'

import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { Vector2Input } from '../inputs/Vector2Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

const mediaComponentQuery = defineQuery([MediaComponent])

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @param       {any} props
 * @constructor
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const video = useState(getComponent(props.node.entity, VideoComponent))

  const mediaEntities = useQuery(mediaComponentQuery)

  const entityTree = Engine.instance.currentWorld.entityTree

  const mediaOptions = mediaEntities.map((entity) => {
    return { label: getComponent(entity, NameComponent), value: entityTree.entityNodeMap.get(entity)!.uuid }
  })
  mediaOptions.unshift({ label: 'Self', value: '' })

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
          onChange={(value) => {
            video.mediaUUID.set(value)
          }}
          options={mediaOptions}
          isSearchable
        />
      </InputGroup>

      <InputGroup
        name="Video Size"
        label={t('editor:properties.video.lbl-size')}
        info={t('editor:properties.video.lbl-size-info')}
      >
        <Vector2Input
          value={video.size.value}
          onChange={(value) => {
            video.size.set(value)
          }}
        />
      </InputGroup>

      <InputGroup
        name="Video Fit"
        label={t('editor:properties.video.lbl-fit')}
        info={t('editor:properties.video.lbl-fit-info')}
      >
        <SelectInput
          value={video.mediaUUID.value}
          onChange={(value) => {
            video.mediaUUID.set(value)
          }}
          options={mediaOptions}
        />
      </InputGroup>
    </NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

export default VideoNodeEditor
