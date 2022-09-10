import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ShadowComponent } from '@xrengine/engine/src/scene/components/ShadowComponent'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * ShadowProperties used to create editor view for the properties of ModelNode.
 *
 * @type {class component}
 */
export const ShadowProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const shadowComponent = getComponent(props.node.entity, ShadowComponent)

  return (
    <NodeEditor component={ShadowComponent} description={t('editor:properties.model.description')} {...props}>
      <InputGroup name="Cast Shadow" label={t('editor:properties.model.lbl-castShadow')}>
        <BooleanInput value={shadowComponent.cast} onChange={updateProperty(ShadowComponent, 'cast')} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.model.lbl-receiveShadow')}>
        <BooleanInput value={shadowComponent.receive} onChange={updateProperty(ShadowComponent, 'receive')} />
      </InputGroup>
    </NodeEditor>
  )
}

export default ShadowProperties
