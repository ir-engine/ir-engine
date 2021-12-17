import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import SelectInput from '../inputs/SelectInput'
import { VideoProjection } from '@xrengine/engine/src/scene/classes/Video'
import VideoInput from '../inputs/VideoInput'
import VideocamIcon from '@mui/icons-material/Videocam'
import AudioSourceProperties from './AudioSourceProperties'
import useSetPropertySelected from './Util'
import { ControlledStringInput } from '../inputs/StringInput'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

/**
 * videoProjectionOptions contains VideoProjection options.
 *
 * @author Robert Long
 * @type {object}
 */
const videoProjectionOptions = Object.values(VideoProjection).map((v) => ({ label: v, value: v }))

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export function VideoNodeEditor(props) {
  const { node } = props
  const { t } = useTranslation()

  VideoNodeEditor.description = t('editor:properties.video.description')
  //function to handle changes in src property
  const onChangeIsLivestream = useSetPropertySelected('isLivestream')
  //function to handle changes in src property
  const onChangeSrc = useSetPropertySelected('src')

  //function to handle change in projection property
  const onChangeProjection = useSetPropertySelected('projection')

  //function to handle change in projection property
  const onChangeInteractable = useSetPropertySelected('interactable')

  //function to handle change in projection property
  const onChangeId = useSetPropertySelected('elementId')

  //editor view for VideoNode
  return (
    <NodeEditor description={VideoNodeEditor.description} {...props}>
      <InputGroup name="Livestream" label={t('editor:properties.video.lbl-islivestream')}>
        <BooleanInput value={node.isLivestream} onChange={onChangeIsLivestream} />
      </InputGroup>
      <InputGroup name="Video" label={t('editor:properties.video.lbl-video')}>
        <VideoInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
        <SelectInput options={videoProjectionOptions} value={node.projection} onChange={onChangeProjection} />
      </InputGroup>
      <InputGroup name="Interactable" label={t('editor:properties.video.lbl-interactable')}>
        <BooleanInput value={node.interactable} onChange={onChangeInteractable} />
      </InputGroup>
      <InputGroup name="Location" label={t('editor:properties.video.lbl-id')}>
        <ControlledStringInput value={node.elementId} onChange={onChangeId} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

// setting description will appears on editor view
VideoNodeEditor.description = i18n.t('editor:properties.video.description')
export default VideoNodeEditor
