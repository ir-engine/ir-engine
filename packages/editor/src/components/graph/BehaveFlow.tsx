import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getMutableComponent, hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getMutableState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'
import { SelectionState } from '../../services/SelectionServices'
import { Flow } from './ee-flow'
import { useRegistry } from './ee-flow/hooks/useRegistry'
import './ee-flow/styles.css'

const BehaveFlow = () => {
  const registry = useRegistry()

  const selectionState = useHookstate(getMutableState(SelectionState))
  const entities = selectionState.selectedEntities.value
  const entity = entities[entities.length - 1]
  const validEntity = typeof entity === 'number' && hasComponent(entity, BehaveGraphComponent)
  const graphState = getMutableComponent(validEntity ? entity : UndefinedEntity, BehaveGraphComponent)
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    forceUpdate()
  }, [selectionState.objectChangeCounter])

  return (
    <AutoSizer>
      {({ width, height }) => (
        <div style={{ width, height }}>
          {validEntity && (
            <Flow
              initialGraph={graphState?.value?.graph ?? {}}
              examples={{}}
              registry={registry}
              onChangeGraph={(newGraph) => {
                if (!graphState.graph) return
                graphState.graph.set(newGraph)
              }}
            />
          )}
        </div>
      )}
    </AutoSizer>
  )
}

export default BehaveFlow
