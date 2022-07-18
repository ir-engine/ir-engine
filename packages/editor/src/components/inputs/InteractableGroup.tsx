import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'

import { EditorComponentType, updateProperty } from '../properties/Util'
import InputGroup from './InputGroup'
import NumericInputGroup from './NumericInputGroup'
import StringInput from './StringInput'

export const InteractableGroup: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const interactableComponent = getComponent(props.node.entity, InteractableComponent)?.value
  if (!interactableComponent) return null!

  return (
    <Fragment>
      <InputGroup name="Interaction Text" label={t('editor:properties.interaction.text')}>
        <StringInput
          value={interactableComponent.interactionText}
          onChange={updateProperty(InteractableComponent, 'interactionText')}
        />
      </InputGroup>
      <NumericInputGroup
        name="Interaction Distance"
        label={t('editor:properties.interaction.distance')}
        onChange={updateProperty(InteractableComponent, 'interactionDistance')}
        min={0}
        smallStep={0.001}
        mediumStep={0.01}
        largeStep={0.1}
        value={interactableComponent.interactionDistance}
      />
    </Fragment>
  )
}

export default InteractableGroup
