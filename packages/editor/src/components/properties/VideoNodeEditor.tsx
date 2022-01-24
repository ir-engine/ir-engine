import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import VideoInput from '../inputs/VideoInput'
import VideocamIcon from '@mui/icons-material/Videocam'
import AudioSourceProperties from './AudioSourceProperties'
import { EditorComponentType, updateProperty } from './Util'
import { ControlledStringInput } from '../inputs/StringInput'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import ImageSourceProperties from './ImageSourceProperties'
import { PropertiesPanelButton } from '../inputs/Button'
import MediaSourceProperties from './MediaSourceProperties'
import BooleanInput from '../inputs/BooleanInput'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { toggleVideo } from '@xrengine/engine/src/scene/functions/loaders/VideoFunctions'

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const videoComponent = getComponent(props.node.entity, VideoComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
    >
      <InputGroup name="Video" label={t('editor:properties.video.lbl-video')}>
        <VideoInput value={videoComponent.videoSource} onChange={updateProperty(VideoComponent, 'videoSource')} />
        {videoComponent.error && <div style={{ color: '#FF8C00' }}>{t('editor:properties.audio.error-url')}</div>}
      </InputGroup>
      <InputGroup name="Location" label={t('editor:properties.video.lbl-id')}>
        <ControlledStringInput
          value={videoComponent.elementId}
          onChange={updateProperty(VideoComponent, 'elementId')}
        />
      </InputGroup>
      <MediaSourceProperties node={props.node} multiEdit={props.multiEdit} />
      <PropertiesPanelButton onClick={() => toggleVideo(props.node.entity)}>
        {t('editor:properties.video.lbl-test')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

export default VideoNodeEditor
