import React from 'react'
import i18n from 'i18next'
import { useTranslation, withTranslation } from 'react-i18next'
import { Dashboard } from '@mui/icons-material'
import InputGroup from '../inputs/InputGroup'
import ScriptNode from '../../nodes/ScriptNode'
import { CommandManager } from '../../managers/CommandManager'
import NodeEditor from './NodeEditor'
import FileBrowserInput from '../inputs/FileBrowserInput'
import EditorEvents from '../../constants/EditorEvents'
import { CustomScriptFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { ItemTypes } from '../../constants/AssetTypes'

/**
 * Define properties for Script component.
 *
 * @author Hanzla Mateen
 * @type {Object}
 */

type ScriptNodeEditorProps = {
  node?: ScriptNode
  t: Function
}

/**
 * For Scripts
 *
 * @author Hanzla Mateen
 * @param       {Object} props
 * @constructor
 */

export const ScriptNodeEditor = (props: ScriptNodeEditorProps) => {
  const { node } = props
  const { t } = useTranslation()

  const onChangePath = (path) => {
    node.validatePath(path)
    if (node.isValidURL) {
      CommandManager.instance.setPropertyOnSelection('scriptPath', path)
    }
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [node])
  }

  return (
    <NodeEditor description={ScriptNodeEditor.description} {...props}>
      <InputGroup name="Script" label={t('editor:properties.scriptnode.lbl-scripturl')}>
        <FileBrowserInput
          acceptFileTypes={CustomScriptFileTypes}
          acceptDropItems={ItemTypes.Script}
          value={node.scriptPath}
          onChange={onChangePath}
        />
        {!node.isValidURL && <div>{t('editor:properties.scriptnode.error-url')}</div>}
      </InputGroup>
    </NodeEditor>
  )
}

ScriptNodeEditor.iconComponent = Dashboard
ScriptNodeEditor.description = i18n.t('editor:properties.scriptnode.description')

export default withTranslation()(ScriptNodeEditor)
