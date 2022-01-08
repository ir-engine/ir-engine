import React from 'react'

import PropertyGroup from './PropertyGroup'

//declaring NodeEditorProps
type NodeEditorProps = {
  name?: string
  description?: string
  node?: any
  disableTransform?: boolean
  children?: any
  multiEdit?: boolean
}

/**
 * NodeEditor component used to render editor view.
 *
 * @author Robert Long
 * @type {class component}
 */
export const NodeEditor = (props: NodeEditorProps) => {
  const { node, description, children } = props

  return (
    <PropertyGroup name={node.nodeName} description={description}>
      {children}
    </PropertyGroup>
  )
}

export default NodeEditor
