import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@xrengine/engine/src/scene/components/VolumetricComponent'
import { toggleAudio } from '@xrengine/engine/src/scene/functions/loaders/AudioFunctions'

import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import AudioInput from '../inputs/AudioInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import AudioSourceProperties from './AudioSourceProperties'
import MediaSourceProperties from './MediaSourceProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @author Robert Long
 * @param       {Object} props
 * @constructor
 */
export const AudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [_, setState] = useState(0)
  const engineState = useEngineState()
  const entity = props.node.entity

  const audioComponent = getComponent(entity, AudioComponent)
  const isVideo = hasComponent(entity, VideoComponent)
  const isVolumetric = hasComponent(entity, VolumetricComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)
  const obj3d = getComponent(entity, Object3DComponent)?.value

  const updateSrc = async (src: string) => {
    AssetLoader.Cache.delete(src)
    await AssetLoader.loadAsync(src)
    updateProperty(AudioComponent, 'audioSource')(src)
  }

  const onToggleAudio = () => {
    toggleAudio(entity)
    setState(_ + 1)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
    >
      {!isVideo && !isVolumetric && (
        <InputGroup name="Audio Url" label={t('editor:properties.audio.lbl-audiourl')}>
          <AudioInput value={audioComponent.audioSource} onChange={updateSrc} />
          {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.audio.error-url')}</div>}
        </InputGroup>
      )}
      <AudioSourceProperties node={props.node} multiEdit={props.multiEdit} />
      {!isVideo && !isVolumetric && (
        <>
          <MediaSourceProperties node={props.node} multiEdit={props.multiEdit} />
          <PropertiesPanelButton onClick={onToggleAudio}>
            {obj3d && obj3d.userData.audioEl?.isPlaying
              ? t('editor:properties.audio.lbl-pause')
              : t('editor:properties.audio.lbl-play')}
          </PropertiesPanelButton>
        </>
      )}
    </NodeEditor>
  )
}

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUpIcon

export default AudioNodeEditor
