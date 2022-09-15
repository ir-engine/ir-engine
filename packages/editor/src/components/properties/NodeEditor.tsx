import React, { PropsWithChildren } from 'react'

import { hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { useEditorState } from '../../services/EditorServices'
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
 * @type {class component}
 */
export const NodeEditor: React.FC<PropsWithChildren<NodeEditorProps>> = ({
  description,
  children,
  name,
  node,
  component
}) => {
  const editorState = useEditorState()
  return (
    <PropertyGroup
      name={name}
      description={description}
      onClose={
        editorState.advancedMode.value && component && hasComponent(node.entity, component)
          ? () => removeComponent(node.entity, component)
          : undefined
      }
    >
      {children}
    </PropertyGroup>
  )
}

export default NodeEditor
