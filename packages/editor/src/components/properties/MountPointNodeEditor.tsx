import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MountPoint, MountPointComponent } from '@xrengine/engine/src/scene/components/MountPointComponent'

import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorPropType, updateProperty } from './Util'

const MountPointTypes = [{ label: 'Seat', value: MountPoint.seat }]

export const MountPointNodeEditor: React.FC<EditorPropType> = (props) => {
  const { t } = useTranslation()

  const mountPointComponent = getComponent(props.node.entity, MountPointComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.mountPoint.name')}
      description={t('editor:properties.mountPoint.description')}
    >
      <InputGroup name="Type" label={t('editor:properties.mountPoint.lbl-type')}>
        <SelectInput
          key={props.node.entity}
          options={MountPointTypes}
          value={mountPointComponent.type}
          onChange={updateProperty(MountPointComponent, 'type')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

export default MountPointNodeEditor
