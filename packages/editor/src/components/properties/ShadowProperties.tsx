import React from 'react'
import { useTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { CommandManager } from '../../managers/CommandManager'
import { ShadowComponent } from '@xrengine/engine/src/scene/components/ShadowComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorComponentType } from './Util'
import { updateShadow } from '@xrengine/engine/src/scene/functions/loaders/ShadowFunctions'

/**
 * ShadowProperties used to create editor view for the properties of ModelNode.
 *
 * @author Nayankumar Patel <github.com/NPatel10>
 * @type {class component}
 */
export const ShadowProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const onChangeCastShadow = (castShadow) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: ShadowComponent,
      properties: { castShadow }
    })
  }

  const onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: ShadowComponent,
      properties: { receiveShadow }
    })
  }

  const shadowComponent = getComponent(props.node.entity, ShadowComponent)

  return (
    <NodeEditor description={t('editor:properties.model.description')} {...props}>
      <InputGroup name="Cast Shadow" label={t('editor:properties.model.lbl-castShadow')}>
        <BooleanInput value={shadowComponent.castShadow} onChange={onChangeCastShadow} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.model.lbl-receiveShadow')}>
        <BooleanInput value={shadowComponent.receiveShadow} onChange={onChangeReceiveShadow} />
      </InputGroup>
    </NodeEditor>
  )
}

export default ShadowProperties
