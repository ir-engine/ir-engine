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

import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { BehaveGraphState } from '@etherealengine/engine/src/behave-graph/state/BehaveGraphState'
import { Entity, UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getMutableComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { isEqual } from 'lodash'
import React, { useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'
import { SelectionState } from '../../services/SelectionServices'
import { PropertiesPanelButton } from '../inputs/Button'
import { Flow } from './ee-flow'
import './ee-flow/styles.css'

const BehaveFlow = () => {
  const selectionState = useHookstate(getMutableState(SelectionState))
  const entities = selectionState.selectedEntities.value
  const entity = entities[entities.length - 1]
  const validEntity = typeof entity === 'number' && hasComponent(entity, BehaveGraphComponent)
  const graphComponent = getMutableComponent(validEntity ? entity : UndefinedEntity, BehaveGraphComponent)
  const forceUpdate = useForceUpdate()
  const behaveGraphState = useHookstate(getMutableState(BehaveGraphState))

  const addGraph = () => {
    setComponent(entity as Entity, BehaveGraphComponent)
    forceUpdate()
  }
  useEffect(() => {
    forceUpdate()
  }, [selectionState.objectChangeCounter])

  return (
    <AutoSizer>
      {({ width, height }) => (
        <div style={{ width, height }}>
          {!validEntity && (
            <PropertiesPanelButton
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => {
                addGraph()
              }}
            >
              {' '}
              Add Graph
            </PropertiesPanelButton>
          )}
          {validEntity && (
            <Flow
              initialGraph={graphComponent?.value?.graph}
              examples={{}}
              registry={behaveGraphState.registries.get(NO_PROXY)[graphComponent?.domain.value]}
              onChangeGraph={(newGraph) => {
                if (!graphComponent.graph || isEqual(graphComponent.graph.get(NO_PROXY), newGraph)) return
                graphComponent.graph.set(JSON.parse(JSON.stringify(newGraph)))
              }}
            />
          )}
        </div>
      )}
    </AutoSizer>
  )
}

export default BehaveFlow
