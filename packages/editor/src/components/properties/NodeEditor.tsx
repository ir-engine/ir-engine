import React from 'react'
import PropertyGroup from './PropertyGroup'
import { EditorPropType } from './Util'

//declaring NodeEditorProps
type NodeEditorProps = EditorPropType & {
  description?: string
  name?: string
}

/**
 * NodeEditor component used to render editor view.
 *
 * @author Robert Long
 * @type {class component}
 */
export const NodeEditor: React.FC<NodeEditorProps> = (props) => {
  const { description, children, name } = props

  return (
    <PropertyGroup name={name} description={description}>
      {children}
    </PropertyGroup>
  )
}

export default NodeEditor
