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

import { setTransformMode, toggleSnapMode } from '@ir-engine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@ir-engine/editor/src/services/EditorHelperState'
import { ObjectGridSnapState } from '@ir-engine/editor/src/systems/ObjectGridSnapSystem'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { SnapMode, TransformMode } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { MoveMd, Refresh1Md, Scale02Md, SnappingToolMd } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
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

const scaleSnapOptions = [
  { label: '1', value: 1 },
  { label: '1.25', value: 1.25 },
  { label: '1.5', value: 1.5 },
  { label: '1.75', value: 1.75 },
  { label: '2', value: 2 },
  { label: '2.5', value: 2.5 },
  { label: '3', value: 3 }
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

  const onChangeScaleSnap = (snapValue: number) => {
    getMutableState(EditorHelperState).scaleSnap.set(snapValue)
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
    <div className="flex items-center gap-x-4">
      <Tooltip position={'auto'} content={t('editor:toolbar.transformSnapTool.info-snaps')}>
        <Text className={'dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.transformSnapTool.lbl-snaps')}
        </Text>
      </Tooltip>

      <div className="flex items-center gap-x-2">
        <Tooltip content={t('editor:toolbar.transformSnapTool.lbl-translate')} position="bottom">
          <ViewportButton
            lean={true}
            selected={editorHelperState.transformMode.value === TransformMode.translate}
            icon={MoveMd}
            onClick={() => setTransformMode(TransformMode.translate)}
          />
        </Tooltip>
        <ToolbarDropdown
          tooltipContent={t('editor:toolbar.transformSnapTool.info-translate')}
          tooltipPosition="bottom"
          onChange={onChangeTranslationSnap}
          options={translationSnapOptions}
          value={editorHelperState.translationSnap.value}
          width="full"
          inputHeight="xs"
          dropdownParentClassName="w-[6rem]"
        />
      </div>

      <div className="flex items-center gap-x-2">
        <Tooltip content={t('editor:toolbar.transformSnapTool.lbl-rotate')} position="bottom">
          <ViewportButton
            lean={true}
            selected={editorHelperState.transformMode.value === TransformMode.rotate}
            icon={Refresh1Md}
            onClick={() => setTransformMode(TransformMode.rotate)}
          />
        </Tooltip>
        <Tooltip content={t('editor:toolbar.transformSnapTool.toggleSnapMode')} position="bottom">
          <ViewportButton
            onClick={toggleSnapMode}
            selected={editorHelperState.gridSnap.value === SnapMode.Grid}
            icon={SnappingToolMd}
          />
        </Tooltip>
        <ToolbarDropdown
          tooltipContent={t('editor:toolbar.transformSnapTool.info-rotate')}
          tooltipPosition="bottom"
          onChange={onChangeRotationSnap}
          options={rotationSnapOptions}
          value={editorHelperState.rotationSnap.value}
          width="full"
          inputHeight="xs"
          dropdownParentClassName="w-[4rem]"
        />
      </div>

      <div className="flex items-center gap-x-2">
        <Tooltip content={t('editor:toolbar.transformSnapTool.lbl-scale')} position="bottom">
          <ViewportButton
            lean={true}
            selected={editorHelperState.transformMode.value === TransformMode.scale}
            icon={Scale02Md}
            onClick={() => setTransformMode(TransformMode.scale)}
          />
        </Tooltip>
        <ToolbarDropdown
          tooltipContent={t('editor:toolbar.transformSnapTool.info-scale')}
          tooltipPosition="bottom"
          onChange={onChangeScaleSnap}
          options={scaleSnapOptions}
          value={editorHelperState.scaleSnap.value}
          width="full"
          inputHeight="xs"
          dropdownParentClassName="w-[5rem]"
        />
      </div>
    </div>
  )
}

export default TransformSnapTool
