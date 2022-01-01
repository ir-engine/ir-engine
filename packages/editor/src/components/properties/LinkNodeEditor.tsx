import React from 'react'
import LinkIcon from '@mui/icons-material/Link'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorComponentType } from './Util'

export const LinkNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  //function to handle change in href property of LinkNode
  const onChangeHref = (href) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: LinkComponent,
      properties: { href }
    })
  }

  //rendering view of editor for properties of LinkNode
  const linkComponent = getComponent(props.node.entity, LinkComponent)

  return (
    <NodeEditor description={t('editor:properties.link.description')} {...props}>
      <InputGroup name="Url" label={t('editor:properties.link.lbl-url')}>
        <StringInput value={linkComponent.href} onChange={onChangeHref} />
      </InputGroup>
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = LinkIcon

export default LinkNodeEditor
