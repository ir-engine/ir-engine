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

import { useDraggable } from '@ir-engine/client-core/src/hooks/useDraggable'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { setTransformMode } from '@ir-engine/editor/src/functions/transformFunctions'
import { TransformMode } from '@ir-engine/engine/src/scene/constants/transformConstants'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { Tooltip } from '@ir-engine/ui'
import { ToolbarButton } from '@ir-engine/ui/editor'
import { Cursor03Default, Refresh1Md, Scale02Md, TransformMd } from '@ir-engine/ui/src/icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TbMarquee2 } from 'react-icons/tb'
import { EditorHelperState } from '../../../services/EditorHelperState'
import { SelectionBoxState } from './SelectionBoxTool'

const GizmoTools = {
  ...TransformMode,
  pointer: 'pointer' as const,
  selectionBox: 'selection_box' as const
}

type GizmoToolsType = (typeof GizmoTools)[keyof typeof GizmoTools]

function Placer({ id }: { id: string }) {
  return (
    <div id={id} className="z-[6] flex flex-col gap-0.5">
      <div className="h-0.5 w-6 bg-[#2B2C30]" />
      <div className="h-0.5 w-6 bg-[#2B2C30]" />
    </div>
  )
}

export default function TransformGizmoTool() {
  const { t } = useTranslation()
  const [_, setPointerSelected] = useState(false)
  const [isClickedSelectionBox, setIsClickedSelectionBox] = useState(false)

  const editorHelperState = useMutableState(EditorHelperState)
  const transformMode = editorHelperState.transformMode.value
  const [toolSelected, setToolSelected] = useState<GizmoToolsType>(transformMode)
  const handleClickSelectionBox = () => {
    setIsClickedSelectionBox(!isClickedSelectionBox)
    getMutableState(SelectionBoxState).selectionBoxEnabled.set(!isClickedSelectionBox)
    getMutableState(InputState).capturingCameraOrbitEnabled.set(isClickedSelectionBox)
    setToolSelected(GizmoTools.selectionBox)
  }

  useDraggable({
    targetId: 'gizmo-tool',
    placerId: 'gizmo-tool-placer',
    topOffset: 36,
    targetStartY: 56,
    targetStartX: 16
  })

  useEffect(() => {
    const mode = editorHelperState.transformMode.value
    setToolSelected(mode)
  }, [editorHelperState.transformMode])

  return (
    <div id="gizmo-tool" className={`absolute z-[5] flex flex-col items-center rounded-lg bg-[#080808] p-2`}>
      <Placer id="gizmo-tool-placer" />
      <div className="mt-2 flex flex-col overflow-hidden rounded bg-[#212226]">
        <Tooltip content={t('editor:toolbar.gizmo.pointer')} position="right">
          <ToolbarButton
            onClick={() => {
              EditorControlFunctions.replaceSelection([])
              setToolSelected(GizmoTools.pointer)
            }}
            selected={toolSelected === GizmoTools.pointer}
          >
            <Cursor03Default />
          </ToolbarButton>
        </Tooltip>
        <Tooltip content={t('editor:toolbar.gizmo.translate')} position="right">
          <ToolbarButton
            onClick={() => {
              setTransformMode(TransformMode.translate)
              setToolSelected(GizmoTools.translate)
            }}
            selected={toolSelected === GizmoTools.translate}
          >
            <Scale02Md />
          </ToolbarButton>
        </Tooltip>
        <Tooltip content={t('editor:toolbar.gizmo.rotate')} position="right">
          <ToolbarButton
            onClick={() => {
              setTransformMode(TransformMode.rotate)
              setToolSelected(GizmoTools.rotate)
            }}
            selected={toolSelected === GizmoTools.rotate}
          >
            <Refresh1Md />
          </ToolbarButton>
        </Tooltip>
        <Tooltip content={t('editor:toolbar.gizmo.scale')} position="right">
          <ToolbarButton
            onClick={() => {
              setTransformMode(TransformMode.scale)
              setToolSelected(GizmoTools.scale)
            }}
            selected={toolSelected === GizmoTools.scale}
          >
            <TransformMd />
          </ToolbarButton>
        </Tooltip>
        <Tooltip content={t('disable orbit camera and enable selection box')} position="right">
          <ToolbarButton onClick={handleClickSelectionBox} selected={toolSelected === GizmoTools.selectionBox}>
            <TbMarquee2 />
          </ToolbarButton>
        </Tooltip>
      </div>
    </div>
  )
}
