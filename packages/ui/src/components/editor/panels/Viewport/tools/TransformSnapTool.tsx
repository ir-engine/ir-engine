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

import { SnapMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { toggleSnapMode } from '@etherealengine/editor/src/functions/transformFunctions'
import { EditorHelperState, PlacementMode } from '@etherealengine/editor/src/services/EditorHelperState'
import { ObjectGridSnapState } from '@etherealengine/editor/src/systems/ObjectGridSnapSystem'
import { useTranslation } from 'react-i18next'
import { LuMousePointerClick, LuMove3D, LuUtilityPole } from 'react-icons/lu'
import { MdOutlineCenterFocusWeak } from 'react-icons/md'
import Button from '../../../../../primitives/tailwind/Button'
import Select from '../../../../../primitives/tailwind/Select'

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
    <div id="transform-snap" className="flex items-center bg-theme-surfaceInput">
      <Button
        startIcon={<LuUtilityPole />}
        onClick={toggleAttachmentPointSnap}
        variant={objectSnapState.enabled.value ? 'outline' : 'transparent'}
        title={t('editor:toolbar.transformSnapTool.toggleBBoxSnap')}
        className="px-0"
      />
      <Button
        startIcon={<MdOutlineCenterFocusWeak />}
        onClick={toggleSnapMode}
        variant={editorHelperState.gridSnap.value === SnapMode.Grid ? 'outline' : 'transparent'}
        title={t('editor:toolbar.transformSnapTool.toggleSnapMode')}
        className="px-0"
      />
      {/* <Tooltip title={t('editor:toolbar.transformSnapTool.info-translate')} direction="right"> */}
      <Select
        key={editorHelperState.translationSnap.value}
        inputClassName="py-1 h-6 rounded-sm text-[#A3A3A3] text-xs"
        className="w-20 p-1"
        onChange={onChangeTranslationSnap}
        options={translationSnapOptions}
        currentValue={editorHelperState.translationSnap.value}
      />
      {/* </Tooltip>
          <Tooltip title={t('editor:toolbar.transformSnapTool.info-rotate')} direction="right"> */}
      <Select
        key={editorHelperState.rotationSnap.value}
        inputClassName="py-1 h-6 rounded-sm text-[#A3A3A3] text-xs"
        className="w-20 p-1"
        onChange={onChangeRotationSnap}
        options={rotationSnapOptions}
        currentValue={editorHelperState.rotationSnap.value}
      />
      {/* </Tooltip> */}
      <Button
        startIcon={<LuMousePointerClick />}
        onClick={() => editorHelperState.placementMode.set(PlacementMode.CLICK)}
        variant={editorHelperState.placementMode.value === PlacementMode.CLICK ? 'outline' : 'transparent'}
        title={t('editor:toolbar.placement.click')}
        className="px-0"
      />
      <Button
        startIcon={<LuMove3D />}
        onClick={() => editorHelperState.placementMode.set(PlacementMode.DRAG)}
        variant={editorHelperState.placementMode.value === PlacementMode.DRAG ? 'outline' : 'transparent'}
        title={t('editor:toolbar.placement.drag')}
        className="px-0"
      />
    </div>
  )
}

export default TransformSnapTool
