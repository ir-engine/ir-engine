import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VPSWayspotComponent } from '@xrengine/engine/src/xr/VPSComponents'

import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const VPSWayspotNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const wayspot = useComponent(props.node.entity, VPSWayspotComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.vps-wayspot.name')}
      description={t('editor:properties.vps-wayspot.description')}
    >
      <InputGroup name="Volume" label={t('editor:properties.vps-wayspot.lbl-name')}>
        <StringInput value={wayspot.name.value} onChange={updateProperty(VPSWayspotComponent, 'name')} />
      </InputGroup>
    </NodeEditor>
  )
}

export default VPSWayspotNodeEditor
