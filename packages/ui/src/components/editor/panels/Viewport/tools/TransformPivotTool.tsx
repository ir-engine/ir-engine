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

import React from 'react'

import { TransformPivot } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { setTransformPivot, toggleTransformPivot } from '@etherealengine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@etherealengine/editor/src/services/EditorHelperState'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import { FaRegDotCircle } from 'react-icons/fa'
import Button from '../../../../../primitives/tailwind/Button'
import Select from '../../../../../primitives/tailwind/Select'

const transformPivotOptions = [
  {
    label: t('editor:toolbar.transformPivot.lbl-selection'),
    description: t('editor:toolbar.transformPivot.info-selection'),
    value: TransformPivot.Selection
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-center'),
    description: t('editor:toolbar.transformPivot.info-center'),
    value: TransformPivot.Center
  },
  {
    label: t('editor:toolbar.transformPivot.lbl-bottom'),
    description: t('editor:toolbar.transformPivot.info-bottom'),
    value: TransformPivot.Bottom
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
    <div id="transform-pivot" className="flex items-center bg-theme-surfaceInput">
      <Button
        startIcon={<FaRegDotCircle />}
        onClick={toggleTransformPivot}
        variant="transparent"
        title={t('editor:toolbar.transformPivot.toggleTransformPivot')}
        className="px-0"
      />
      <Select
        key={editorHelperState.transformPivot.value}
        inputClassName="py-1 h-6 rounded-sm text-theme-primary-400 text-xs"
        className="w-28 p-1"
        onChange={setTransformPivot}
        options={transformPivotOptions}
        currentValue={editorHelperState.transformPivot.value}
      />
    </div>
  )
}

export default TransformPivotTool
