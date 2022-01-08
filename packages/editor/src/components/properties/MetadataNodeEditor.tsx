import React from 'react'

import AnalyticsIcon from '@mui/icons-material/Analytics'

import { CommandManager } from '../../managers/CommandManager'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'

type MetadataNodeEditorProps = {
  node?: any
}

export function MetadataNodeEditor(props: MetadataNodeEditorProps) {
  const { node } = props

  const onChangeData = (value) => {
    CommandManager.instance.setPropertyOnSelection('_data', value)
  }

  const description = 'Metadata Node for the Digital Being'

  return (
    <NodeEditor {...props} description={description}>
      <InputGroup name="Data" label="Data">
        <StringInput value={node._data} onChange={onChangeData} />
      </InputGroup>
    </NodeEditor>
  )
}

MetadataNodeEditor.iconComponent = AnalyticsIcon

export default MetadataNodeEditor
