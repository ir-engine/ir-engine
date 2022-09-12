import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
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

  const engineState = useEngineState()
  const media = getComponent(props.node.entity, MediaComponent)

  const mediaNoProxy = useHookstate(media).get({ noproxy: true })
  const hasError = engineState.errorEntities[props.node.entity].get()
  const error = getComponent(props.node.entity, ErrorComponent)

  const toggle = () => {
    media.paused.set(!media.paused.value)
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
        <CompoundNumericInput value={mediaNoProxy.volume} onChange={(value) => media.volume.set(value)} />
      </InputGroup>
      <InputGroup name="Is Music" label={t('editor:properties.media.lbl-isMusic')}>
        <BooleanInput value={mediaNoProxy.isMusic} onChange={(value) => media.isMusic.set(value)} />
      </InputGroup>
      <InputGroup
        name="Controls"
        label={t('editor:properties.media.lbl-controls')}
        info={t('editor:properties.media.info-controls')}
      >
        <BooleanInput value={mediaNoProxy.controls} onChange={(value) => media.controls.set(value)} />
      </InputGroup>
      <InputGroup
        name="Auto Play"
        label={t('editor:properties.media.lbl-autoplay')}
        info={t('editor:properties.media.info-autoplay')}
      >
        <BooleanInput value={mediaNoProxy.autoplay} onChange={(value) => media.autoplay.set(value)} />
      </InputGroup>
      <InputGroup
        name="Synchronize"
        label={t('editor:properties.media.lbl-synchronize')}
        info={t('editor:properties.media.info-synchronize')}
      >
        <BooleanInput value={mediaNoProxy.synchronize} onChange={(value) => media.synchronize.set(value)} />
      </InputGroup>
      <ArrayInputGroup
        name="Source Paths"
        prefix="Content"
        values={mediaNoProxy.paths}
        onChange={(value) => media.paths.set(value)}
        label={t('editor:properties.media.paths')}
        acceptFileTypes={AllFileTypes}
        itemType={SupportedFileTypes}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.node.entity}
          options={PlayModeOptions}
          value={mediaNoProxy.playMode}
          onChange={(value) => media.playMode.set(value)}
        />
        {mediaNoProxy.paths && mediaNoProxy.paths.length > 0 && mediaNoProxy.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {mediaNoProxy.paused ? t('editor:properties.media.playtitle') : t('editor:properties.media.pausetitle')}
          </Button>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

export default MediaNodeEditor
