import React from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { useTranslation } from 'react-i18next'
import PanToolIcon from '@mui/icons-material/PanTool'
import { CommandManager } from '../../managers/CommandManager'

type BoxColliderNodeEditorProps = {
  node?: any
  multiEdit: boolean
}

/**
 * BoxColliderNodeEditor is used to provide properties to customize box collider element.
 *
 * @author Robert Long
 * @type {[component class]}
 */
export const BoxColliderNodeEditor = (props: BoxColliderNodeEditorProps) => {
  const { t } = useTranslation()

  // function to handle the changes on trigger property
  const onChangeTrigger = (isTrigger) => {
    CommandManager.instance.setPropertyOnSelection('isTrigger', isTrigger)
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.boxCollider.description')}>
      <InputGroup name="Trigger" label={t('editor:properties.boxCollider.lbl-isTrigger')}>
        <BooleanInput value={props.node?.isTrigger} onChange={onChangeTrigger} />
      </InputGroup>
    </NodeEditor>
  )
}

BoxColliderNodeEditor.iconComponent = PanToolIcon

export default BoxColliderNodeEditor
