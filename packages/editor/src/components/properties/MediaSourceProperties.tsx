import React from 'react'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { EditorComponentType, updateProperty } from './Util'
import { useTranslation } from 'react-i18next'
import NumericInput from '../inputs/NumericInput'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaComponent } from '@xrengine/engine/src/scene/components/MediaComponent'

export const MediaSourceProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mediaComponent = getComponent(props.node.entity, MediaComponent)

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
      <InputGroup
        name="Loop"
        label={t('editor:properties.audio.lbl-loop')}
        info={t('editor:properties.audio.info-loop')}
      >
        <BooleanInput value={mediaComponent.loop} onChange={updateProperty(MediaComponent, 'loop')} />
      </InputGroup>
    </>
  )
}

export default MediaSourceProperties
