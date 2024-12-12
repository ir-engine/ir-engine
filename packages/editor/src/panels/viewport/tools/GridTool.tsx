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

import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Tooltip } from '@ir-engine/ui'
import NumericInput from '@ir-engine/ui/src/components/editor/input/Numeric'
import { GridDotsMd } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

const GridTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)

  const onToggleGridVisible = () => {
    rendererState.gridVisibility.set(!rendererState.gridVisibility.value)
  }

  useEffect(() => {
    if (!rendererState.gridVisibility.value) {
      rendererState.gridVisibility.set(true)
    }
  }, [])

  return (
    <div className="flex items-center rounded bg-[#0E0F11] p-1">
      <Tooltip content={t('editor:toolbar.grid.info-toggleGridVisibility')} position="bottom">
        <GridDotsMd
          onClick={onToggleGridVisible}
          className={twMerge('text-[#9CA0AA]', rendererState.gridVisibility.value && 'text-[#F5F5F5]')}
        />
      </Tooltip>
      <Tooltip content={t('editor:toolbar.grid.info-gridHeight')}>
        <NumericInput
          value={rendererState.gridHeight.value}
          onChange={(value) => rendererState.gridHeight.set(value)}
          className="h-5 w-16 rounded-sm border-theme-input bg-transparent px-2 py-1"
          inputClassName="text-theme-gray3"
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
