import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistentAnchorComponent } from '@etherealengine/engine/src/xr/XRAnchorComponents'

import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const PersistentAnchorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const anchor = useComponent(props.entity, PersistentAnchorComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.persistent-anchor.name')}
      description={t('editor:properties.persistent-anchor.description')}
    >
      <InputGroup name="Volume" label={t('editor:properties.persistent-anchor.lbl-name')}>
        <StringInput value={anchor.name.value} onChange={updateProperty(PersistentAnchorComponent, 'name')} />
      </InputGroup>
    </NodeEditor>
  )
}

export default PersistentAnchorNodeEditor
