import React from 'react'
import LinkIcon from '@mui/icons-material/Link'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { useTranslation } from 'react-i18next'
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorComponentType, updateProperty } from './Util'

export const LinkNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const linkComponent = getComponent(props.node.entity, LinkComponent)

  return (
    <NodeEditor description={t('editor:properties.link.description')} {...props}>
      <InputGroup name="Url" label={t('editor:properties.link.lbl-url')}>
        <StringInput value={linkComponent.href} onChange={updateProperty(LinkComponent, 'href')} />
      </InputGroup>
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = LinkIcon

export default LinkNodeEditor
