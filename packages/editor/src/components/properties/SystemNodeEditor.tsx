import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { validatePath } from '@xrengine/common/src/utils/validatePath'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { SystemComponent } from '@xrengine/engine/src/scene/components/SystemComponent'

import ExtensionIcon from '@mui/icons-material/Extension'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ScriptInput from '../inputs/ScriptInput'
import { SelectInput } from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * Define properties for Script component.
 *
 * @type {Object}
 */

const systemUpdateTypes = [
  {
    label: 'None',
    value: 'None'
  },
  {
    label: 'Update',
    value: SystemUpdateType.UPDATE
  },
  {
    label: 'Fixed Early',
    value: SystemUpdateType.FIXED_EARLY
  },
  {
    label: 'Fixed',
    value: SystemUpdateType.FIXED
  },
  {
    label: 'Fixed Late',
    value: SystemUpdateType.FIXED_LATE
  },
  {
    label: 'Pre Render',
    value: SystemUpdateType.PRE_RENDER
  },
  {
    label: 'Post Render',
    value: SystemUpdateType.POST_RENDER
  }
]

/**
 * For Scripts
 *
 * @param       {Object} props
 * @constructor
 */
export const SystemNodeEditor: EditorComponentType = (props) => {
  const [isPathValid, setPathValid] = useState(true)
  const { t } = useTranslation()

  const onChangePath = (path) => {
    if (validatePath(path)) {
      setPropertyOnSelectionEntities({
        component: SystemComponent,
        properties: [{ filePath: path }]
      })

      setPathValid(true)
    } else {
      setPathValid(false)
    }
  }

  const systemComponent = getComponent(props.node.entity, SystemComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.systemnode.name')}
      description={t('editor:properties.systemnode.description')}
    >
      <InputGroup name="Script" label={t('editor:properties.systemnode.lbl-filePath')}>
        <ScriptInput value={systemComponent.filePath} onChange={onChangePath} />
        {!isPathValid && <div>{t('editor:properties.systemnode.error-url')}</div>}
      </InputGroup>
      <InputGroup name="systemUpdateType" label={t('editor:properties.systemnode.lbl-systemUpdateType')}>
        <SelectInput
          key={props.node.entity}
          options={systemUpdateTypes}
          onChange={updateProperty(SystemComponent, 'systemUpdateType')}
          value={systemComponent.systemUpdateType}
        />
      </InputGroup>
      <InputGroup name="enableClient" label={t('editor:properties.systemnode.lbl-enableClient')}>
        <BooleanInput onChange={updateProperty(SystemComponent, 'enableClient')} value={systemComponent.enableClient} />
      </InputGroup>
      <InputGroup name="enableServer" label={t('editor:properties.systemnode.lbl-enableServer')}>
        <BooleanInput onChange={updateProperty(SystemComponent, 'enableServer')} value={systemComponent.enableServer} />
      </InputGroup>
      <InputGroup name="args" label={t('editor:properties.systemnode.lbl-args')}>
        <StringInput onChange={updateProperty(SystemComponent, 'args')} value={systemComponent.args} />
      </InputGroup>
    </NodeEditor>
  )
}

SystemNodeEditor.iconComponent = ExtensionIcon

export default SystemNodeEditor
