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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { EngineState } from '@ir-engine/ecs/src/EngineState'
import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import NumericInput from '@ir-engine/ui/src/components/editor/input/Numeric'
import { GridDotsMd } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorHelperState } from '../../../services/EditorHelperState'

const GridTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)
  const engineState = useMutableState(EngineState)

  const onToggleGridVisible = () => {
    editorHelperState.gridVisibility.set(!editorHelperState.gridVisibility.value)
  }

  useEffect(() => {
    if (!editorHelperState.gridVisibility.value) {
      editorHelperState.gridVisibility.set(true)
    }
  }, [])

  useEffect(() => {
    if (engineState.isEditing.value) {
      rendererState.gridVisibility.set(editorHelperState.gridVisibility.value)
      rendererState.gridHeight.set(editorHelperState.gridHeight.value)
    } else {
      rendererState.gridVisibility.set(false)
    }
  }, [editorHelperState.gridVisibility, editorHelperState.gridHeight, engineState.isEditing])

  return (
    <div className="flex items-center gap-x-1">
      <Tooltip content={t('editor:toolbar.grid.info-toggleGridVisibility')} position="bottom">
        <ViewportButton
          lean={true}
          onClick={onToggleGridVisible}
          icon={GridDotsMd}
          selected={editorHelperState.gridVisibility.value}
        />
      </Tooltip>
      <Tooltip content={t('editor:toolbar.grid.info-gridHeight')} position="bottom">
        <NumericInput
          value={editorHelperState.gridHeight.value}
          onChange={(value) => editorHelperState.gridHeight.set(value)}
          precision={0.01}
          smallStep={0.5}
          mediumStep={1}
          largeStep={5}
          min={0.0}
          unit="m"
        />
      </Tooltip>
    </div>
  )
}

export default GridTool
