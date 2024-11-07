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

import { MdOutlineAdd, MdOutlineCancel } from 'react-icons/md'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactFlow } from 'reactflow'

import { UndefinedEntity } from '@ir-engine/ecs'
import { NodetoEnginetype } from '@ir-engine/engine'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import StringInput from '@ir-engine/ui/src/components/editor/input/String'
import PaginatedList from '@ir-engine/ui/src/components/editor/layout/PaginatedList'
import ParameterInput from '@ir-engine/ui/src/components/editor/properties/parameter'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { GraphTemplate, VariableJSON, VisualScriptDomain, VisualScriptState } from '@ir-engine/visual-script'
import NodeEditor from '../properties/common/NodeEditor'
import { useTemplateHandler, useVariableHandler, useVisualScriptFlow } from './hooks'
import { Examples } from './modals/load'
import { visualToFlow } from './transformers'

type templateHandler = ReturnType<typeof useTemplateHandler>
type variableHandler = ReturnType<typeof useVariableHandler>
type visualScriptFlow = ReturnType<typeof useVisualScriptFlow>

export type SidePanelProps = {
  flowref: React.MutableRefObject<HTMLElement | null>
  examples: Examples
  variables: VariableJSON[]
}

export const SidePanel = ({
  flowref,
  examples,
  variables,
  onNodesChange,
  handleAddTemplate,
  handleApplyTemplate,
  handleDeleteTemplate,
  handleEditTemplate,
  handleAddVariable,
  handleEditVariable,
  handleDeleteVariable
}: SidePanelProps &
  Pick<templateHandler, 'handleApplyTemplate' | 'handleDeleteTemplate' | 'handleEditTemplate' | 'handleAddTemplate'> &
  Pick<visualScriptFlow, 'onNodesChange'> &
  Pick<variableHandler, 'handleAddVariable' | 'handleDeleteVariable' | 'handleEditVariable'>) => {
  const reactFlow = useReactFlow()
  const visualScriptState = useMutableState(VisualScriptState)
  const { t } = useTranslation()
  const graphTypes = visualScriptState.registries[VisualScriptDomain.ECS].values.get(NO_PROXY)

  useEffect(() => {
    for (const graph of Object.values(examples)) {
      const [nodes, edges] = visualToFlow(graph)
      handleAddTemplate(nodes, edges)
    }
  }, [examples, handleAddTemplate])

  return (
    <NodeEditor entity={UndefinedEntity} name={t('editor:visualScript.sidePanel.title')}>
      {/*<NodeEditor
        entity={UndefinedEntity}
        name={t('editor:visualScript.sidePanel.node.name')}
        description={t('editor:visualScript.sidePanel.node.description')}
      >
        <PaginatedList
          options={{ countPerPage: 10 }}
          list={Object.keys(visualScriptState.registries[VisualScriptDomain.ECS].nodes)}
          element={(nodeName: string, index) => {
            return (
              <Button
                variant="outline"
                className="w-full truncate p-0 lowercase"
                onClick={() => {
                  const bounds = (flowref.current! as any).getBoundingClientRect()
                  const centerX = bounds.left + bounds.width / 2
                  const centerY = bounds.top + bounds.height / 2
                  const viewportCenter = reactFlow.screenToFlowPosition({ x: centerX, y: centerY } as XYPosition)
                  const position = viewportCenter // need a way to get viewport
                  const newNode = {
                    id: uuidv4(),
                    type: nodeName,
                    position,
                    data: { configuration: {}, values: {} } //fill with default values here
                  }
                  onNodesChange([
                    {
                      type: 'add',
                      item: newNode
                    }
                  ])
                }}
              >
                <Panel title={nodeName}></Panel>
              </Button>
            )
          }}
        ></PaginatedList>
      </NodeEditor>*/}
      <NodeEditor
        entity={UndefinedEntity}
        name={t('editor:visualScript.sidePanel.template.name')}
        description={t('editor:visualScript.sidePanel.template.description')}
      >
        <PaginatedList
          options={{ countPerPage: 5 }}
          list={visualScriptState.templates.get(NO_PROXY) as GraphTemplate[]}
          element={(template: any, index) => {
            return (
              <div className="flex w-full">
                <Button
                  variant="outline"
                  className="h-7 w-[20%]"
                  onClick={() => {
                    handleApplyTemplate(template)
                  }}
                >
                  <MdOutlineAdd className="inline-block shrink-0 text-2xl" />
                </Button>
                <StringInput
                  value={template.name}
                  onChange={(e) => {
                    template.name = e
                    handleEditTemplate(template)
                  }}
                ></StringInput>

                <Button
                  variant="outline"
                  className="h-7 w-[20%]"
                  style={{ width: '20%' }}
                  onClick={() => {
                    handleDeleteTemplate(template)
                  }}
                >
                  <MdOutlineCancel className="inline-block shrink-0 text-2xl" />
                </Button>
              </div>
            )
          }}
        ></PaginatedList>
      </NodeEditor>
      <NodeEditor
        entity={UndefinedEntity}
        name={t('editor:visualScript.sidePanel.variables.name')}
        description={t('editor:visualScript.sidePanel.variables.description')}
      >
        <PaginatedList
          options={{ countPerPage: 5 }}
          list={variables}
          element={(variable: VariableJSON, index) => {
            return (
              <NodeEditor entity={UndefinedEntity} name={variable.name}>
                <div className="flex w-full flex-col">
                  <div className="flex w-full flex-row overflow-hidden">
                    <StringInput
                      value={variable.name}
                      onChange={(e) => {
                        handleEditVariable({ ...variable, name: e })
                      }}
                    ></StringInput>
                    <Button
                      variant="outline"
                      className="h-7 w-[10%] "
                      onClick={() => {
                        handleDeleteVariable(variable)
                      }}
                    >
                      <MdOutlineCancel className="inline-block shrink-0 text-2xl" />
                    </Button>
                  </div>
                  <SelectInput
                    options={Object.keys(graphTypes).map((valueType) => {
                      return { label: valueType, value: valueType }
                    })}
                    value={variable.valueTypeName}
                    onChange={(value) => {
                      handleEditVariable({
                        ...variable,
                        valueTypeName: value as string,
                        initialValue: graphTypes[value].creator()
                      })
                    }}
                  />
                  <ParameterInput
                    entity={`${UndefinedEntity}`}
                    values={[NodetoEnginetype(variable.initialValue, variable.valueTypeName)]}
                    onChange={(key) => (e) => {
                      let value = e
                      if (variable.valueTypeName !== 'object' && typeof e === 'object') value = e.target.value
                      handleEditVariable({ ...variable, initialValue: value })
                    }}
                  />
                </div>
              </NodeEditor>
            )
          }}
        ></PaginatedList>
        <div className="flex w-full flex-row justify-center">
          <Button
            variant="outline"
            onClick={() => {
              handleAddVariable()
            }}
          >
            {t('editor:visualScript.sidePanel.variables.add')}
          </Button>
        </div>
      </NodeEditor>
    </NodeEditor>
  )
}

export default SidePanel
