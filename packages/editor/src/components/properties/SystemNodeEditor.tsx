import React from 'react'
import i18n from 'i18next'
import { useTranslation, withTranslation } from 'react-i18next'
import InputGroup from '../inputs/InputGroup'
import Systemnode from '../../nodes/SystemNode'
import { CommandManager } from '../../managers/CommandManager'
import NodeEditor from './NodeEditor'
import EditorEvents from '../../constants/EditorEvents'
import ExtensionIcon from '@mui/icons-material/Extension'
import { validatePath } from '@xrengine/common/src/utils/validatePath'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { SelectInput } from '../inputs/SelectInput'
import BooleanInput from '../inputs/BooleanInput'
import StringInput from '../inputs/StringInput'
import ScriptInput from '../inputs/ScriptInput'

/**
 * Define properties for Script component.
 *
 * @author Hanzla Mateen
 * @type {Object}
 */

type SystemNodeEditorProps = {
  node?: Systemnode
  t: Function
}

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
 * @author Hanzla Mateen
 * @param       {Object} props
 * @constructor
 */

export const SystemnodeEditor = (props: SystemNodeEditorProps) => {
  const { node } = props
  const { t } = useTranslation()

  const onChangePath = (path) => {
    if (validatePath(path)) {
      CommandManager.instance.setPropertyOnSelection('filePath', path)
    }
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [node])
  }

  const onChangeSystemUpdateType = (systemUpdateType) => {
    CommandManager.instance.setPropertyOnSelection('systemUpdateType', systemUpdateType)
  }

  const onChangeEnableClient = (enableClient) => {
    CommandManager.instance.setPropertyOnSelection('enableClient', enableClient)
  }

  const onChangeEnableServer = (enableServer) => {
    CommandManager.instance.setPropertyOnSelection('enableServer', enableServer)
  }

  const onChangeArgs = (args) => {
    CommandManager.instance.setPropertyOnSelection('args', args)
  }

  return (
    <NodeEditor description={SystemnodeEditor.description} {...props}>
      <InputGroup name="Script" label={t('editor:properties.systemnode.lbl-filePath')}>
        <ScriptInput value={node.filePath} onChange={onChangePath} />
        {!node.isValidURL && <div>{t('editor:properties.systemnode.error-url')}</div>}
      </InputGroup>
      <InputGroup name="systemUpdateType" label={t('editor:properties.systemnode.lbl-systemUpdateType')}>
        <SelectInput options={systemUpdateTypes} onChange={onChangeSystemUpdateType} value={node.systemUpdateType} />
      </InputGroup>
      <InputGroup name="enableClient" label={t('editor:properties.systemnode.lbl-enableClient')}>
        <BooleanInput onChange={onChangeEnableClient} value={node.enableClient} />
      </InputGroup>
      <InputGroup name="enableServer" label={t('editor:properties.systemnode.lbl-enableServer')}>
        <BooleanInput onChange={onChangeEnableServer} value={node.enableServer} />
      </InputGroup>
      <InputGroup name="args" label={t('editor:properties.systemnode.lbl-args')}>
        <StringInput onChange={onChangeArgs} value={node.args} />
      </InputGroup>
    </NodeEditor>
  )
}

SystemnodeEditor.iconComponent = ExtensionIcon
SystemnodeEditor.description = i18n.t('editor:properties.systemnode.description')

export default withTranslation()(SystemnodeEditor)
