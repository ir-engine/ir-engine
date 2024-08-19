/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { PropsWithChildren, Suspense } from 'react'

import { hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorPropType } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { useTranslation } from 'react-i18next'
import LoadingView from '../../../../primitives/tailwind/LoadingView'
import Text from '../../../../primitives/tailwind/Text'
import PropertyGroup from '../group'

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
        <div className="m-2.5 overflow-auto bg-gray-600 text-red-500">
          <Text fontWeight="bold" component="h1">
            [{this.props.name}] {this.state.error.message}`
          </Text>
          <pre>{this.state.error.stack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

type NodeEditorProps = EditorPropType & {
  description?: string
  name?: string
  icon?: JSX.Element
}

export const NodeEditor: React.FC<PropsWithChildren<NodeEditorProps>> = ({
  description,
  children,
  name,
  entity,
  component,
  icon
}) => {
  const { t } = useTranslation()

  return (
    <PropertyGroup
      name={name}
      description={description}
      icon={icon}
      onClose={
        component && hasComponent(entity, component)
          ? () => {
              const entities = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(entities, component, false)
            }
          : undefined
      }
    >
      <Suspense
        fallback={
          <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingApp', { name })} />
        }
      >
        <NodeEditorErrorBoundary name={name}>{children}</NodeEditorErrorBoundary>
      </Suspense>
    </PropertyGroup>
  )
}

export default NodeEditor
