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

import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { setTransformMode } from '@etherealengine/editor/src/functions/transformFunctions'
import { EditorHelperState } from '@etherealengine/editor/src/services/EditorHelperState'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { useMutableState } from '@etherealengine/hyperflux'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TbPointer, TbRefresh, TbVector, TbWindowMaximize } from 'react-icons/tb'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'

function Placer() {
  return (
    <>
      <div className="mt-2 h-1 w-6 bg-[#2B2C30]" />
      <div className="mt-1 h-1 w-6 bg-[#2B2C30]" />
    </>
  )
}

export default function GizmoTool() {
  const editorHelperState = useMutableState(EditorHelperState)
  const transformMode = editorHelperState.transformMode.value
  const selected = SelectionState.useSelectedEntities()
  const { t } = useTranslation()

  return (
    <div className="absolute left-4 top-14 z-10 flex flex-col items-center rounded-lg bg-black p-2">
      <Placer />
      <Tooltip title={t('editor:toolbar.gizmo.description')} position={'top center'}>
        <div className="mt-2 flex flex-col rounded bg-theme-surface-main">
          <Tooltip title={t('editor:toolbar.gizmo.pointer')} position={'right center'}>
            <Button
              variant="transparent"
              className={twMerge(
                'border-b border-b-theme-primary p-2 text-[#A3A3A3]',
                selected.length === 0 && 'bg-theme-highlight text-white'
              )}
              iconContainerClassName="m-0"
              startIcon={<TbPointer />}
              onClick={() => EditorControlFunctions.replaceSelection([])}
            />
          </Tooltip>
          <Tooltip title={t('editor:toolbar.gizmo.translate')} position={'right center'}>
            <Button
              variant="transparent"
              className={twMerge(
                'border-b border-b-theme-primary p-2 text-[#A3A3A3]',
                transformMode === TransformMode.translate && 'bg-theme-highlight text-white'
              )}
              iconContainerClassName="m-0"
              startIcon={<TbVector />}
              title="Translate (key W)"
              onClick={() => setTransformMode(TransformMode.translate)}
            />
          </Tooltip>
          <Tooltip title={t('editor:toolbar.gizmo.rotate')} position={'right center'}>
            <Button
              variant="transparent"
              className={twMerge(
                'border-b border-b-theme-primary p-2 text-[#A3A3A3]',
                transformMode === TransformMode.rotate && 'bg-theme-highlight text-white'
              )}
              iconContainerClassName="m-0"
              startIcon={<TbRefresh />}
              title="Rotate (key E)"
              onClick={() => setTransformMode(TransformMode.rotate)}
            />
          </Tooltip>
          <Tooltip title={t('editor:toolbar.gizmo.scale')} position={'right center'}>
            <Button
              variant="transparent"
              className={twMerge(
                'p-2 text-[#A3A3A3]',
                transformMode === TransformMode.scale && 'bg-theme-highlight text-white'
              )}
              iconContainerClassName="m-0"
              startIcon={<TbWindowMaximize />}
              title="Scale (key R)"
              onClick={() => setTransformMode(TransformMode.scale)}
            />
          </Tooltip>
        </div>
      </Tooltip>
    </div>
  )
}
