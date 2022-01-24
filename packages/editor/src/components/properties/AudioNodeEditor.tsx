import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import AudioInput from '../inputs/AudioInput'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import AudioSourceProperties from './AudioSourceProperties'
import { EditorComponentType, updateProperty } from './Util'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { PropertiesPanelButton } from '../inputs/Button'
import MediaSourceProperties from './MediaSourceProperties'
import { toggleAudio } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @author Robert Long
 * @param       {Object} props
 * @constructor
 */
export const AudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const audioComponent = getComponent(props.node.entity, AudioComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
    >
      <InputGroup name="Audio Url" label={t('editor:properties.audio.lbl-audiourl')}>
        <AudioInput value={audioComponent.audioSource} onChange={updateProperty(AudioComponent, 'audioSource')} />
        {audioComponent.error && <div style={{ color: '#FF8C00' }}>{t('editor:properties.audio.error-url')}</div>}
      </InputGroup>
      <AudioSourceProperties node={props.node} multiEdit={props.multiEdit} />
      <MediaSourceProperties node={props.node} multiEdit={props.multiEdit} />
      <PropertiesPanelButton onClick={() => toggleAudio(props.node.entity)}>
        {t('editor:properties.audio.lbl-test')}
      </PropertiesPanelButton>
    </NodeEditor>
  )
}

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUpIcon

export default AudioNodeEditor
