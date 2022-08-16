import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CallbackComponent } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { MediaElementComponent } from '@xrengine/engine/src/scene/components/MediaElementComponent'
import { PlayMode } from '@xrengine/engine/src/scene/constants/PlayMode'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import SelectInput from '../inputs/SelectInput'
import { EditorComponentType, updateProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.Single
  },
  {
    label: 'Random',
    value: PlayMode.Random
  },
  {
    label: 'Loop',
    value: PlayMode.Loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.SingleLoop
  }
]

export const MediaNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isPlaying, setPlaying] = useState(false)
  const engineState = useEngineState()

  const mediaComponent = getComponent(props.node.entity, MediaComponent)
  const mediaElement = getComponent(props.node.entity, MediaElementComponent)
  const hasError = engineState.errorEntities[props.node.entity].get() || hasComponent(props.node.entity, ErrorComponent)

  const toggle = () => {
    const callback = getComponent(props.node.entity, CallbackComponent) as any
    isPlaying ? callback?.pause() : callback?.play()
    setPlaying(!isPlaying)
  }

  return (
    <>
      <InputGroup
        name="Controls"
        label={t('editor:properties.media.lbl-controls')}
        info={t('editor:properties.media.info-controls')}
      >
        <BooleanInput value={mediaComponent.controls} onChange={updateProperty(MediaComponent, 'controls')} />
      </InputGroup>
      <InputGroup
        name="Auto Play"
        label={t('editor:properties.media.lbl-autoplay')}
        info={t('editor:properties.media.info-autoplay')}
      >
        <BooleanInput value={mediaComponent.autoplay} onChange={updateProperty(MediaComponent, 'autoplay')} />
      </InputGroup>
      <InputGroup
        name="Synchronize"
        label={t('editor:properties.media.lbl-synchronize')}
        info={t('editor:properties.media.info-synchronize')}
      >
        <NumericInput value={mediaComponent.autoStartTime} onChange={updateProperty(MediaComponent, 'autoStartTime')} />
      </InputGroup>
      {hasError && <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.video.error-url')}</div>}
      <ArrayInputGroup
        name="Source Paths"
        prefix="Content"
        values={mediaComponent.paths}
        onChange={updateProperty(MediaComponent, 'paths')}
        label={t('editor:properties.media.paths')}
        acceptFileTypes={AllFileTypes}
        itemType={SupportedFileTypes}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.node.entity}
          options={PlayModeOptions}
          value={mediaComponent.playMode}
          onChange={updateProperty(MediaComponent, 'playMode')}
        />
        {mediaComponent.paths && mediaComponent.paths.length > 0 && mediaComponent.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {isPlaying ? t('editor:properties.media.pausetitle') : t('editor:properties.media.playtitle')}
          </Button>
        )}
      </InputGroup>
    </>
  )
}

export default MediaNodeEditor
