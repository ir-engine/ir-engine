import React from 'react'
import { Analytics } from '@styled-icons/material/Analytics'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import { useTranslation, withTranslation } from 'react-i18next'

/**
 * @author Alex Titonis
 */
//The NodeEditor is creating the ui for the nodes with type MetadataNode
export function MetadataNodeEditor(props: { editor?: any; node?: any; t: any }) {
  //The props of the node
  const { node, editor } = props

  //This callback is called when changing the value of the _data
  const onChangeData = (value) => {
    editor.setPropertySelected('_data', value)
  }

  const description = 'Metadata Node for the Digital Being'

  //This returns the layout of the ui, first it creates the editor, then it creates the group for the input fields, finally it adds the
  //StringInput (text field), which is setting the value for the _data
  return (
    <NodeEditor {...props} description={description}>
      {/* @ts-ignore */}
      <InputGroup name="Data" label="Data">
        {/* @ts-ignore */}
        <StringInput value={node._data} onChange={onChangeData} />
      </InputGroup>
    </NodeEditor>
  )
}

//These are used to set the icon for the node in the ui (using Styled Icons), the description of the node and enables the edit of the transform
MetadataNodeEditor.iconComponent = Analytics
MetadataNodeEditor.description = 'Metadata Node for the Digital Being'
export default withTranslation()(MetadataNodeEditor)
