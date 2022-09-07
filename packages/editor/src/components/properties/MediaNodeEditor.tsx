import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CallbackComponent } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { PlayMode } from '@xrengine/engine/src/scene/constants/PlayMode'
import { useHookstate } from '@xrengine/hyperflux'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

export const MediaNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isPlaying, setPlaying] = useState(false)
  const engineState = useEngineState()

  const mediaComponent = useHookstate(getComponent(props.node.entity, MediaComponent)).get({ noproxy: true })
  const hasError = engineState.errorEntities[props.node.entity].get()
  const error = getComponent(props.node.entity, ErrorComponent)

  const toggle = () => {
    const callback = getComponent(props.node.entity, CallbackComponent) as any
    isPlaying ? callback?.pause() : callback?.play()
    setPlaying(!isPlaying)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.media.name')}
      description={t('editor:properties.media.description')}
    >
      {hasError && error.mediaError && (
        <div style={{ marginTop: 2, color: '#FF8C00' }}>{'Error: ' + error.mediaError}</div>
      )}
      <InputGroup name="Volume" label={t('editor:properties.media.lbl-volume')}>
        <CompoundNumericInput value={mediaComponent.volume} onChange={updateProperty(MediaComponent, 'volume')} />
      </InputGroup>
      <InputGroup name="Is Music" label={t('editor:properties.media.lbl-isMusic')}>
        <BooleanInput value={mediaComponent.isMusic} onChange={updateProperty(MediaComponent, 'isMusic')} />
      </InputGroup>
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
        <BooleanInput value={mediaComponent.synchronize} onChange={updateProperty(MediaComponent, 'synchronize')} />
      </InputGroup>
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
    </NodeEditor>
  )
}

export default MediaNodeEditor
