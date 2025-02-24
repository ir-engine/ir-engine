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

import { getComponent, hasComponent, useQuery } from '@ir-engine/ecs'
import { commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { VisualScriptComponent } from '@ir-engine/engine'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { VisualScriptState } from '@ir-engine/visual-script'
import { isEqual } from 'lodash'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { Flow } from '../flow'
import './ReactFlowStyle.css'

export const ActiveVisualScript = (props: { entity }) => {
  const { entity } = props

  // reactivity
  const visualScriptState = getState(VisualScriptState)

  // get underlying data, avoid hookstate error 202
  const visualScriptComponent = getComponent(entity, VisualScriptComponent)

  if (visualScriptComponent.visualScript === null) return null
  return (
    <ReactFlowProvider>
      <Flow
        initialVisualScript={visualScriptComponent.visualScript}
        examples={{}}
        registry={visualScriptState.registries[visualScriptComponent.domain]}
        onChangeVisualScript={(newVisualScript) => {
          if (!newVisualScript) return
          if (isEqual(visualScriptComponent.visualScript, newVisualScript)) return
          commitProperty(VisualScriptComponent, 'visualScript')(newVisualScript)
        }}
      />
    </ReactFlowProvider>
  )
}

const VisualFlow = () => {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const entities = SelectionState.useSelectedEntities()
  const entity = entities[entities.length - 1]
  const validEntity = typeof entity === 'number' && hasComponent(entity, VisualScriptComponent)
  const flowDimensions = useHookstate({ height: 0, width: 0 })

  const addVisualScript = () => EditorControlFunctions.addOrRemoveComponent([entity], VisualScriptComponent, true)

  // ensure reactivity of adding new visualScript
  useQuery([VisualScriptComponent])

  useEffect(() => {
    if (!ref.current) return
    const handleResize = () => {
      if (!ref.current) return
      const { height, width } = ref.current.getBoundingClientRect()
      flowDimensions.set({ height, width })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="flex h-full w-full flex-col" ref={ref}>
      <div
        className="flex items-center justify-center"
        style={{ height: flowDimensions.height.value, width: flowDimensions.width.value }}
      >
        {entities.length && !validEntity ? (
          <Button
            variant="tertiary"
            onClick={() => {
              addVisualScript()
            }}
          >
            {t('editor:visualScript.panel.addVisualScript')}
          </Button>
        ) : (
          <></>
        )}
        {validEntity && <ActiveVisualScript entity={entity} />}
      </div>
    </div>
  )
}

export default VisualFlow
