import React, { Component } from 'react'
import NodeEditor from './NodeEditor'

type DefaultNodeEditorProps = {
  node?: object
}

/**
 * DefaultNodeEditor  used to render view when no element is selected
 *
 * @author Robert Long
 */
const DefaultNodeEditor = (props: DefaultNodeEditorProps) => {
  return <NodeEditor {...props} />
}

export default DefaultNodeEditor
