import React, { Component } from 'react'
import PropertyGroup from './PropertyGroup'

//declairing NodeEditorProps
type NodeEditorProps = {
  name?: string
  description?: string
  node?: object
  editor?: object
  disableTransform?: boolean
}

/**
 * NodeEditor component used to render editor view.
 *
 * @author Robert Long
 * @type {class component}
 */
export class NodeEditor extends Component<NodeEditorProps, {}> {
  render() {
    const { node, description, children } = this.props as any
    return (
      <PropertyGroup name={node.nodeName} description={description}>
        {children}
      </PropertyGroup>
    )
  }
}

export default NodeEditor
