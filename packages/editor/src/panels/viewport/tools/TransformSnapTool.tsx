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

import { toggleSnapMode } from '@ir-engine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { ObjectGridSnapState } from '@ir-engine/editor/src/systems/ObjectGridSnapSystem'
import { SnapMode } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { SnappingToolMd } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuUtilityPole } from 'react-icons/lu'
import ToolbarDropdown from './ToolbarDropdown'

const translationSnapOptions = [
  { label: '0.1m', value: 0.1 },
  { label: '0.125m', value: 0.125 },
  { label: '0.25m', value: 0.25 },
  { label: '0.5m', value: 0.5 },
  { label: '1m', value: 1 },
  { label: '2m', value: 2 },
  { label: '4m', value: 4 }
]

const rotationSnapOptions = [
  { label: '1°', value: 1 },
  { label: '5°', value: 5 },
  { label: '10°', value: 10 },
  { label: '15°', value: 15 },
  { label: '30°', value: 30 },
  { label: '45°', value: 45 },
  { label: '90°', value: 90 }
]

const TransformSnapTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const objectSnapState = useHookstate(getMutableState(ObjectGridSnapState))
  const onChangeTranslationSnap = (snapValue: number) => {
    getMutableState(EditorHelperState).translationSnap.set(snapValue)
    if (editorHelperState.gridSnap.value !== SnapMode.Grid) {
      getMutableState(EditorHelperState).gridSnap.set(SnapMode.Grid)
    }
  }

  const onChangeRotationSnap = (snapValue: number) => {
    getMutableState(EditorHelperState).rotationSnap.set(snapValue)
    if (editorHelperState.gridSnap.value !== SnapMode.Grid) {
      getMutableState(EditorHelperState).gridSnap.set(SnapMode.Grid)
    }
  }

  const toggleAttachmentPointSnap = () => {
    objectSnapState.enabled.set(!objectSnapState.enabled.value)
  }

  return (
    <div className="flex items-center rounded bg-[#141619] py-1">
      <Tooltip content={t('editor:toolbar.transformSnapTool.toggleBBoxSnap')} position="bottom">
        <ViewportButton onClick={toggleAttachmentPointSnap} selected={objectSnapState.enabled.value}>
          <LuUtilityPole />
        </ViewportButton>
      </Tooltip>
      <Tooltip content={t('editor:toolbar.transformSnapTool.toggleSnapMode')} position="bottom">
        <ViewportButton onClick={toggleSnapMode} selected={editorHelperState.gridSnap.value === SnapMode.Grid}>
          <SnappingToolMd />
        </ViewportButton>
      </Tooltip>

      <ToolbarDropdown
        tooltipContent={t('editor:toolbar.transformSnapTool.info-translate')}
        onChange={onChangeTranslationSnap}
        options={translationSnapOptions}
        value={editorHelperState.translationSnap.value}
        width="full"
        inputHeight="xs"
        dropdownParentClassName="w-[82px] p-1"
      />

      <ToolbarDropdown
        tooltipContent={t('editor:toolbar.transformSnapTool.info-rotate')}
        onChange={onChangeRotationSnap}
        options={rotationSnapOptions}
        value={editorHelperState.rotationSnap.value}
        width="full"
        inputHeight="xs"
        dropdownParentClassName="w-[65px] p-1"
      />
    </div>
  )
}

export default TransformSnapTool
