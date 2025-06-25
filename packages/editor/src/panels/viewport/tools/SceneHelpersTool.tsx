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

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { EditorHelperState, PlacementMode } from '@ir-engine/editor/src/services/EditorHelperState'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { CubeOutlineLg, Cursor03Lg, GridDotsMd, RulerUnitsMd, SunMd } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuMousePointerClick, LuMove3D } from 'react-icons/lu'
import { VolumeVisibility } from '../../../functions/gizmos/studioIconGizmoHelper'

const volumeVisbilityDescriptions = {
  On: 'On : Show all volumes in scene',
  Auto: 'Auto : Show volumes on hover in scene',
  Off: 'Off : Hide all volumes in scene'
}

export default function SceneHelpersTool() {
  const { t } = useTranslation()
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)
  const [pointClickEnabled] = useFeatureFlags([FeatureFlags.Studio.UI.PointClick])

  useEffect(() => {
    getMutableState(RendererState).nodeHelperVisibility.set(
      editorHelperState.volumeVisibility.value !== VolumeVisibility.Off
    )
  }, [editorHelperState.volumeVisibility])

  const onVolumeVisibilityClick = () => {
    switch (editorHelperState.volumeVisibility.value) {
      case VolumeVisibility.Off:
        editorHelperState.volumeVisibility.set(VolumeVisibility.Auto)
        break
      case VolumeVisibility.Auto:
        editorHelperState.volumeVisibility.set(VolumeVisibility.On)
        break
      case VolumeVisibility.On:
        editorHelperState.volumeVisibility.set(VolumeVisibility.Off)
        break
    }
  }

  const isVolumeVisibilityAuto = editorHelperState.volumeVisibility.value === VolumeVisibility.Auto
  const isVolumeVisibilityOn = editorHelperState.volumeVisibility.value === VolumeVisibility.On

  const onToggleGridVisible = () => {
    rendererState.gridVisibility.set(!editorHelperState.gridVisibility.value)
    editorHelperState.gridVisibility.set(!editorHelperState.gridVisibility.value)
  }

  return (
    <div className="flex items-center gap-x-3">
      <Tooltip position={'auto'} content={t('editor:toolbar.helpersToggle.info-helpers')}>
        <Text className={'dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.helpersToggle.lbl-helpers')}
        </Text>
      </Tooltip>
      {pointClickEnabled && (
        <>
          <Tooltip content={t('editor:toolbar.placement.click')} position="bottom">
            <ViewportButton
              lean={true}
              onClick={() => editorHelperState.placementMode.set(PlacementMode.CLICK)}
              selected={editorHelperState.placementMode.value === PlacementMode.CLICK}
              icon={LuMousePointerClick}
            />
          </Tooltip>
          <Tooltip content={t('editor:toolbar.placement.drag')} position="bottom">
            <ViewportButton
              lean={true}
              onClick={() => editorHelperState.placementMode.set(PlacementMode.DRAG)}
              selected={editorHelperState.placementMode.value === PlacementMode.DRAG}
              icon={LuMove3D}
            />
          </Tooltip>
        </>
      )}
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeIcons')}
        content={t('editor:toolbar.helpersToggle.info-nodeHelpers')}
        position="bottom"
      >
        <ViewportButton
          lean={true}
          onClick={() => rendererState.nodeIconVisibility.set(!rendererState.nodeIconVisibility.value)}
          selected={rendererState.nodeIconVisibility.value}
          icon={SunMd}
        />
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeVolume')}
        content={volumeVisbilityDescriptions[editorHelperState.volumeVisibility.value]}
        position="bottom"
      >
        <div className="relative z-10 inline-grid">
          <ViewportButton
            lean={true}
            onClick={onVolumeVisibilityClick}
            selected={isVolumeVisibilityOn}
            icon={CubeOutlineLg}
          />
          {isVolumeVisibilityAuto && (
            <Cursor03Lg className="pointer-events-none absolute -bottom-[0.4em] -right-[0.25em] z-20 text-xs text-text-secondary" />
          )}
        </div>
      </Tooltip>
      <Tooltip content={t('editor:toolbar.grid.info-toggleGridVisibility')} position="bottom">
        <ViewportButton
          lean={true}
          onClick={onToggleGridVisible}
          icon={GridDotsMd}
          selected={editorHelperState.gridVisibility.value}
        />
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-colliderHelpers')}
        content={t('editor:toolbar.helpersToggle.info-helpers')}
        position="bottom"
      >
        <ViewportButton
          lean={true}
          onClick={() => rendererState.physicsDebug.set(!rendererState.physicsDebug.value)}
          disabled={false}
          selected={rendererState.physicsDebug.value}
          icon={RulerUnitsMd}
        />
      </Tooltip>
      {/* <Tooltip content={t('editor:toolbar.helpersToggle.lbl-directManipulation')} position="bottom">
        <ViewportButton lean={true} onClick={() => {}} disabled={true} selected={false} icon={Edit01Md} />
      </Tooltip> */}
    </div>
  )
}
