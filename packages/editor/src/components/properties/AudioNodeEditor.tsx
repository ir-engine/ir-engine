import i18n from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import AudioInput from '../inputs/AudioInput'
import InputGroup from '../inputs/InputGroup'
import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import useSetPropertySelected from './useSetPropertySelected'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @author Robert Long
 * @param       {Object} props
 * @constructor
 */
export function AudioNodeEditor(props) {
  const { node } = props
  const { t } = useTranslation()

  AudioNodeEditor.description = t('editor:properties.audio.description')

  const onChangeSrc = useSetPropertySelected('src')
  //returning view to customize properties
  return (
    <NodeEditor description={AudioNodeEditor.description} {...props}>
      <InputGroup name="Audio Url" label={t('editor:properties.audio.lbl-audiourl')}>
        <AudioInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  )
}

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUpIcon

//setting description for the element
//shows this description in NodeEditor with title of element
AudioNodeEditor.description = i18n.t('editor:properties.audio.description')
export default AudioNodeEditor
