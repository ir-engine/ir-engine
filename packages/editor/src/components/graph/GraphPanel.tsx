import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'

import { useSelectionState } from '../../services/SelectionServices'
import hierarchyStyles from '../hierarchy/styles.module.scss'
import BehaveFlow from './ee-behave-flow/BehaveFlow'

export default function GraphPanel() {
  const selectionState = useSelectionState()
  const entity = selectionState.selectedEntities[0]?.value
  const validEntity = typeof entity === 'number' && hasComponent(entity, BehaveGraphComponent)
  const graphState = useOptionalComponent(validEntity ? entity : UndefinedEntity, BehaveGraphComponent)
  return (
    <>
      <div className={hierarchyStyles.panelContainer}>
        <div className={hierarchyStyles.panelSection}>
          <AutoSizer>
            {({ width, height }) => (
              <div style={{ width, height }}>
                {validEntity && (
                  <BehaveFlow graphJSON={graphState?.graph.value ?? {}} onChangeGraph={graphState?.graph.set} />
                )}
              </div>
            )}
          </AutoSizer>
        </div>
      </div>
    </>
  )
}
