import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VPSWaypointComponent } from '@xrengine/engine/src/xr/VPSComponents'

import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const VPSWaypointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const waypoint = useComponent(props.node.entity, VPSWaypointComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.vps-waypoint.name')}
      description={t('editor:properties.vps-waypoint.description')}
    >
      <InputGroup name="Volume" label={t('editor:properties.vps-waypoint.lbl-name')}>
        <StringInput value={waypoint.name.value} onChange={updateProperty(VPSWaypointComponent, 'name')} />
      </InputGroup>
    </NodeEditor>
  )
}

export default VPSWaypointNodeEditor
