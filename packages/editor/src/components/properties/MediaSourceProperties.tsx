import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'
import { PlayMode } from '@xrengine/engine/src/scene/constants/PlayMode'

import { ItemTypes } from '../../constants/AssetTypes'
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

export const MediaSourceProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isPlaying, setPlaying] = useState(false)

  const mediaComponent = getComponent(props.node.entity, MediaComponent)

  const toggle = () => {
    isPlaying ? mediaComponent.el?.pause() : mediaComponent.el?.play()
    setPlaying(!isPlaying)
  }

  return (
    <>
      <InputGroup
        name="Controls"
        label={t('editor:properties.audio.lbl-controls')}
        info={t('editor:properties.audio.info-controls')}
      >
        <BooleanInput value={mediaComponent.controls} onChange={updateProperty(MediaComponent, 'controls')} />
      </InputGroup>
      <InputGroup
        name="Auto Play"
        label={t('editor:properties.audio.lbl-autoplay')}
        info={t('editor:properties.audio.info-autoplay')}
      >
        <BooleanInput value={mediaComponent.autoplay} onChange={updateProperty(MediaComponent, 'autoplay')} />
      </InputGroup>
      <InputGroup
        name="Synchronize"
        label={t('editor:properties.audio.lbl-synchronize')}
        info={t('editor:properties.audio.info-synchronize')}
      >
        <NumericInput value={mediaComponent.autoStartTime} onChange={updateProperty(MediaComponent, 'autoStartTime')} />
      </InputGroup>
      <ArrayInputGroup
        name="UVOL Paths"
        prefix="Content"
        values={mediaComponent.paths}
        onChange={updateProperty(MediaComponent, 'paths')}
        label={t('editor:properties.volumetric.uvolPaths')}
        acceptFileTypes={AllFileTypes}
        itemType={ItemTypes.Volumetrics}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.volumetric.playmode')}>
        <SelectInput
          key={props.node.entity}
          options={PlayModeOptions}
          value={mediaComponent.playMode}
          onChange={updateProperty(MediaComponent, 'playMode')}
        />
        {mediaComponent.paths && mediaComponent.paths.length > 0 && mediaComponent.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {isPlaying ? t('editor:properties.volumetric.pausetitle') : t('editor:properties.volumetric.playtitle')}
          </Button>
        )}
      </InputGroup>
    </>
  )
}

export default MediaSourceProperties
