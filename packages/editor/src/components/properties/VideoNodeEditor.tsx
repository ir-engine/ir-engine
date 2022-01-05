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
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import MediaSourceProperties from './MediaSourceProperties'

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const toggleAudio = () => {
    const data = getComponent(props.node.entity, Object3DComponent).value.userData

    if (data.videoEl.paused) {
      data.audioEl.play()
      data.videoEl.play()
    } else {
      data.audioEl.stop()
      data.videoEl.pause()
    }
  }

  const videoComponent = getComponent(props.node.entity, VideoComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
    >
      <InputGroup name="Video" label={t('editor:properties.video.lbl-video')}>
        <VideoInput
          value={videoComponent.videoSource}
          onChange={(v) => updateProperty(VideoComponent, 'videoSource', v)}
        />
      </InputGroup>
      <InputGroup name="Location" label={t('editor:properties.video.lbl-id')}>
        <ControlledStringInput
          value={videoComponent.elementId}
          onChange={(v) => updateProperty(VideoComponent, 'elementId', v)}
        />
      </InputGroup>
      {/* <InputGroup name="Livestream" label={t('editor:properties.video.lbl-islivestream')}>
        <BooleanInput value={node.isLivestream} onChange={onChangeIsLivestream} />
      </InputGroup> */}
      {/* <InputGroup name="Interactable" label={t('editor:properties.video.lbl-interactable')}>
        <BooleanInput value={node.interactable} onChange={onChangeInteractable} />
      </InputGroup> */}
      <ImageSourceProperties node={props.node} multiEdit={props.multiEdit} />
      <AudioSourceProperties node={props.node} multiEdit={props.multiEdit} />
      <MediaSourceProperties node={props.node} multiEdit={props.multiEdit} />
      <PropertiesPanelButton onClick={toggleAudio}>{t('editor:properties.video.lbl-test')}</PropertiesPanelButton>
    </NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

export default VideoNodeEditor
