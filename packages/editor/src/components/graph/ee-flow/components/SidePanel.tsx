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

export const SidePanel: React.FC<SidePanelProps> = ({
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
