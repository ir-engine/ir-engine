import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import AudioInput from '../inputs/AudioInput'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import AudioSourceProperties from './AudioSourceProperties'
import { EditorComponentType, updateProperty } from './Util'
import { useTranslation } from 'react-i18next'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { PropertiesPanelButton } from '../inputs/Button'
import MediaSourceProperties from './MediaSourceProperties'
import { toggleAudio } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @author Robert Long
 * @param       {Object} props
 * @constructor
 */
export const AudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity

  const audioComponent = getComponent(entity, AudioComponent)
  const isVideo = hasComponent(entity, VideoComponent)
  const isVolumetric = hasComponent(entity, VolumetricComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
    >
      {!isVideo && !isVolumetric && (
        <InputGroup name="Audio Url" label={t('editor:properties.audio.lbl-audiourl')}>
          <AudioInput value={audioComponent.audioSource} onChange={updateProperty(AudioComponent, 'audioSource')} />
          {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.audio.error-url')}</div>}
        </InputGroup>
      )}
      <AudioSourceProperties node={props.node} multiEdit={props.multiEdit} />
      {!isVideo && !isVolumetric && (
        <>
          <MediaSourceProperties node={props.node} multiEdit={props.multiEdit} />
          <PropertiesPanelButton onClick={() => toggleAudio(entity)}>
            {t('editor:properties.audio.lbl-test')}
          </PropertiesPanelButton>
        </>
      )}
    </NodeEditor>
  )
}

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUpIcon

export default AudioNodeEditor
