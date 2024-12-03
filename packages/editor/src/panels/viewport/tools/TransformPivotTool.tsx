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

import { setTransformPivot, toggleTransformPivot } from '@ir-engine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { TransformPivot } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Select, Tooltip } from '@ir-engine/ui'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaRegDotCircle } from 'react-icons/fa'

const transformPivotOptions = [
  {
    label: t('editor:toolbar.transformPivot.lbl-selection'),
    description: t('editor:toolbar.transformPivot.info-selection'),
    value: TransformPivot.FirstSelected
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-center'),
    description: t('editor:toolbar.transformPivot.info-center'),
    value: TransformPivot.Center
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-bbox'),
    description: t('editor:toolbar.transformPivot.info-bbox'),
    value: TransformPivot.BoundingBox
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-bbox-bottom'),
    description: t('editor:toolbar.transformPivot.info-bbox-bottom'),
    value: TransformPivot.BoundingBoxBottom
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-origin'),
    description: t('editor:toolbar.transformPivot.info-origin'),
    value: TransformPivot.Origin
  }
]

const TransformPivotTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useHookstate(getMutableState(EditorHelperState))

  return (
    <div className="flex items-center rounded bg-[#0E0F11]">
      <Tooltip content={t('editor:toolbar.transformPivot.toggleTransformPivot')}>
        <Button
          startIcon={<FaRegDotCircle className="text-theme-input" />}
          onClick={toggleTransformPivot}
          variant="transparent"
          className="px-0"
          size="small"
        />
      </Tooltip>
      <Tooltip
        content={
          transformPivotOptions.find((pivot) => pivot.value === editorHelperState.transformPivot.value)?.description
        }
        position="right"
      >
        <Select
          key={editorHelperState.transformPivot.value}
          onChange={setTransformPivot}
          options={transformPivotOptions}
          value={editorHelperState.transformPivot.value}
          width="sm"
        />
      </Tooltip>
    </div>
  )
}

export default TransformPivotTool
