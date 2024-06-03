/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { AddOutlined, CancelOutlined } from '@mui/icons-material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { XYPosition, useReactFlow } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { UndefinedEntity } from '@etherealengine/ecs'
import { PropertiesPanelButton } from '@etherealengine/editor/src/components/inputs/Button'
import CollapsibleBlock from '@etherealengine/editor/src/components/layout/CollapsibleBlock'
import PaginatedList from '@etherealengine/editor/src/components/layout/PaginatedList'
import {
  useVisualScriptFlow,
  visualToFlow
} from '@etherealengine/editor/src/components/visualScript/VisualScriptUIModule'
import { useTemplateHandler } from '@etherealengine/editor/src/components/visualScript/hooks/useTemplateHandler'
import { useVariableHandler } from '@etherealengine/editor/src/components/visualScript/hooks/useVariableHandler'
import { NodetoEnginetype } from '@etherealengine/engine'
import { NO_PROXY, useMutableState } from '@etherealengine/hyperflux'
import { GraphTemplate, VariableJSON, VisualScriptDomain, VisualScriptState } from '@etherealengine/visual-script'
import Button from '../../../../../primitives/tailwind/Button'
import SelectInput from '../../../input/Select'
import StringInput from '../../../input/String'
import Panel from '../../../layout/Panel'
import NodeEditor from '../../../properties/nodeEditor'
import ParameterInput from '../../../properties/parameter'
import { Examples } from '../modals/load'

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
    <CollapsibleBlock
      label={t('editor:visualScript.sidePanel.title')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '150px',
        backgroundColor: 'var(--panelBackground)',
        paddingRight: '10px',
        paddingTop: '5px',
        paddingBottom: '5px'
      }}
    >
      <CollapsibleBlock label={t('editor:visualScript.sidePanel.node.name')}>
        <NodeEditor entity={UndefinedEntity} description={t('editor:visualScript.sidePanel.node.description')}>
          <PaginatedList
            options={{ countPerPage: 10 }}
            list={Object.keys(visualScriptState.registries[VisualScriptDomain.ECS].nodes)}
            element={(nodeName: string, index) => {
              return (
                <div>
                  <Button
                    style={{ width: '100%', textTransform: 'lowercase', padding: '0px' }}
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
                </div>
              )
            }}
          ></PaginatedList>
        </NodeEditor>
      </CollapsibleBlock>

      <CollapsibleBlock label={t('editor:visualScript.sidePanel.template.name')}>
        <NodeEditor entity={UndefinedEntity} description={t('editor:visualScript.sidePanel.template.description')}>
          <PaginatedList
            options={{ countPerPage: 5 }}
            list={visualScriptState.templates.get(NO_PROXY) as GraphTemplate[]}
            element={(template: any, index) => {
              return (
                <div style={{ display: 'flex', width: '100%' }}>
                  <Button
                    style={{ width: '20%' }}
                    onClick={() => {
                      handleApplyTemplate(template)
                    }}
                  >
                    <AddOutlined />
                  </Button>
                  <StringInput
                    value={template.name}
                    onChange={(e) => {
                      template.name = e
                      handleEditTemplate(template)
                    }}
                  ></StringInput>

                  <Button
                    style={{ width: '20%' }}
                    onClick={() => {
                      handleDeleteTemplate(template)
                    }}
                  >
                    <CancelOutlined />
                  </Button>
                </div>
              )
            }}
          ></PaginatedList>
        </NodeEditor>
      </CollapsibleBlock>

      <CollapsibleBlock label={t('editor:visualScript.sidePanel.variables.name')}>
        <NodeEditor entity={UndefinedEntity} description={t('editor:visualScript.sidePanel.variables.description')}>
          <PaginatedList
            options={{ countPerPage: 5 }}
            list={variables}
            element={(variable: VariableJSON, index) => {
              return (
                <CollapsibleBlock label={variable.name} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', overflow: 'hidden' }}>
                      <StringInput
                        value={variable.name}
                        onChange={(e) => {
                          handleEditVariable({ ...variable, name: e })
                        }}
                      ></StringInput>
                      <Button
                        style={{ width: '20%' }}
                        onClick={() => {
                          handleDeleteVariable(variable)
                        }}
                      >
                        <CancelOutlined />
                      </Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', overflow: 'hidden' }}>
                      <div style={{ width: '40%' }}>
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
                      </div>
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
                  </div>
                </CollapsibleBlock>
              )
            }}
          ></PaginatedList>
          <PropertiesPanelButton
            style={{ width: '80%' }}
            onClick={() => {
              handleAddVariable()
            }}
          >
            {t('editor:visualScript.sidePanel.variables.add')}
          </PropertiesPanelButton>
        </NodeEditor>
      </CollapsibleBlock>
    </CollapsibleBlock>
  )
}

export default SidePanel
