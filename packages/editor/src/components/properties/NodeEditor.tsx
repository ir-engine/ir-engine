import React, { PropsWithChildren } from 'react'

import { hasComponent, removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchAction } from '@etherealengine/hyperflux'

import { useEditorState } from '../../services/EditorServices'
import { SelectionAction } from '../../services/SelectionServices'
import PropertyGroup from './PropertyGroup'
import { EditorPropType } from './Util'

interface NodeErrorProps {
  name?: string
  children?: React.ReactNode
}

interface NodeErrorState {
  error: Error | null
}

class NodeEditorErrorBoundary extends React.Component<NodeErrorProps, NodeErrorState> {
  public state: NodeErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): NodeErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.error) {
      return (
        <div style={{ margin: 10, color: '#ff0000', overflow: 'auto', backgroundColor: '#222222' }}>
          <h1>
            <b>
              [{this.props.name}] {this.state.error.message}`
            </b>
          </h1>
          <pre>{this.state.error.stack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

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
  entity,
  component
}) => {
  const editorState = useEditorState()
  return (
    <PropertyGroup
      name={name}
      description={description}
      onClose={
        editorState.advancedMode.value && component && hasComponent(entity, component)
          ? () => {
              dispatchAction(SelectionAction.forceUpdate({}))
              removeComponent(entity, component)
            }
          : undefined
      }
    >
      <NodeEditorErrorBoundary name={name}>{children}</NodeEditorErrorBoundary>
    </PropertyGroup>
  )
}

export default NodeEditor
