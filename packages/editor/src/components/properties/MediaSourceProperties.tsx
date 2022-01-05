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
        <BooleanInput value={mediaComponent.controls} onChange={(v) => updateProperty(MediaComponent, 'controls', v)} />
      </InputGroup>
      <InputGroup
        name="Auto Play"
        label={t('editor:properties.audio.lbl-autoplay')}
        info={t('editor:properties.audio.info-autoplay')}
      >
        <BooleanInput value={mediaComponent.autoplay} onChange={(v) => updateProperty(MediaComponent, 'autoplay', v)} />
      </InputGroup>
      <InputGroup
        name="Synchronize"
        label={t('editor:properties.audio.lbl-synchronize')}
        info={t('editor:properties.audio.info-synchronize')}
      >
        <NumericInput
          value={mediaComponent.autoStartTime}
          onChange={(v) => updateProperty(MediaComponent, 'autoStartTime', v)}
        />
      </InputGroup>
      <InputGroup
        name="Loop"
        label={t('editor:properties.audio.lbl-loop')}
        info={t('editor:properties.audio.info-loop')}
      >
        <BooleanInput value={mediaComponent.loop} onChange={(v) => updateProperty(MediaComponent, 'loop', v)} />
      </InputGroup>
    </>
  )
}

export default MediaSourceProperties
