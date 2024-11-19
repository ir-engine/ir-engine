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

import React, { Suspense, useEffect } from 'react'

import { hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorPropType } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import ComponentDropdown, { ComponentDropdownProps } from '@ir-engine/ui/src/components/editor/ComponentDropdown'
import { ComponentDropdownState } from '@ir-engine/ui/src/components/editor/ComponentDropdown/ComponentDropdownState.ts'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'

interface INodeErrorProps {
  name?: string
  children?: React.ReactNode
}

interface INodeErrorState {
  error: Error | null
}

class NodeEditorErrorBoundary extends React.Component<INodeErrorProps, INodeErrorState> {
  public state: INodeErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): INodeErrorState {
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
            [{this.props.name}] {this.state.error.message}
          </Text>
          <pre>{this.state.error.stack}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

const NodeEditor = ({
  description,
  children,
  name,
  entity,
  component,
  Icon
}: ComponentDropdownProps & EditorPropType) => {
  const { t } = useTranslation()

  const minimizedByDefault = false

  useEffect(() => {
    //ensure the entry exists in the state but do not modify it if it already exists
    if (name) ComponentDropdownState.addOrUpdateEntity(entity, name, minimizedByDefault, false)

    return () => {
      const entities = SelectionState.getSelectedEntities()
      //clean up the component from the state for these entities
      if (name && component && !hasComponent(entity, component)) {
        ComponentDropdownState.removeComponentEntry(entities, name)
      }
    }
  }, [])

  return (
    <ComponentDropdown
      name={name}
      description={description}
      Icon={Icon}
      onClose={
        component && hasComponent(entity, component)
          ? () => {
              const entities = SelectionState.getSelectedEntities()
              //remove the component from the entities
              EditorControlFunctions.addOrRemoveComponent(entities, component, false)
            }
          : undefined
      }
      entity={entity}
      minimizedDefault={minimizedByDefault}
    >
      <Suspense
        fallback={<LoadingView className="block h-12 w-12" title={t('common:loader.loadingDynamic', { name })} />}
      >
        <NodeEditorErrorBoundary name={name}>{children}</NodeEditorErrorBoundary>
      </Suspense>
    </ComponentDropdown>
  )
}

export default NodeEditor
