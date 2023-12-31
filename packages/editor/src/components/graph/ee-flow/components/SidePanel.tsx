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

import { BehaveGraphDomain } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { BehaveGraphState } from '@etherealengine/engine/src/behave-graph/state/BehaveGraphState'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { AddOutlined, CancelOutlined } from '@mui/icons-material'
import React from 'react'
import { XYPosition, useReactFlow } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../../inputs/Button'
import StringInput from '../../../inputs/StringInput'
import PaginatedList from '../../../layout/PaginatedList'
import Panel from '../../../layout/Panel'
import NodeEditor from '../../../properties/NodeEditor'
import { useBehaveGraphFlow } from '../hooks/useBehaveGraphFlow'
import { useTemplateHandler } from '../hooks/useTemplateHandler'

type templateHandler = ReturnType<typeof useTemplateHandler>
type BehaveGraphFlow = ReturnType<typeof useBehaveGraphFlow>

export type SidePanelProps = {
  ref: React.MutableRefObject<HTMLElement | null>
}

export const SidePanel = ({
  ref,
  onNodesChange,
  handleApplyTemplate,
  handleDeleteTemplate,
  handleEditTemplate
}: SidePanelProps &
  Pick<templateHandler, 'handleApplyTemplate' | 'handleDeleteTemplate' | 'handleEditTemplate'> &
  Pick<BehaveGraphFlow, 'onNodesChange'>) => {
  const reactFlow = useReactFlow()
  const behaveGraphState = useHookstate(getMutableState(BehaveGraphState))

  return (
    <div
      style={{
        width: '25%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '150px',
        backgroundColor: 'var(--panelBackground)',
        padding: '10px'
      }}
    >
      <div style={{ flex: '35%' }}>
        <NodeEditor entity={UndefinedEntity} name={'Nodes'} description={'collecton of Nodes'}>
          <PaginatedList
            options={{ countPerPage: 10 }}
            list={Object.keys(behaveGraphState.registries[BehaveGraphDomain.ECS].nodes)}
            element={(node: string, index) => {
              return (
                <div>
                  <Button
                    style={{ width: '100%', textTransform: 'lowercase', padding: '0px' }}
                    onClick={() => {
                      const bounds = (ref.current! as any).getBoundingClientRect()
                      const centerX = bounds.left + bounds.width / 2
                      const centerY = bounds.top + bounds.height / 2
                      const viewportCenter = reactFlow.screenToFlowPosition({ x: centerX, y: centerY } as XYPosition)
                      const position = viewportCenter // need a way to get viewport
                      const newNode = {
                        id: uuidv4(),
                        type: node,
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
                    <Panel title={node}></Panel>
                  </Button>
                </div>
              )
            }}
          ></PaginatedList>
        </NodeEditor>
      </div>
      <div style={{ flex: '65%', overflow: 'scroll' }}>
        <NodeEditor entity={UndefinedEntity} name={'Templates'} description={'collecton of Templates'}>
          <PaginatedList
            options={{ countPerPage: 8 }}
            list={behaveGraphState.templates.get(NO_PROXY)}
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
                      template.name = e.target.value
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
      </div>
    </div>
  )
}

export default SidePanel
