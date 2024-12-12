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

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { downloadScreenshot } from '@ir-engine/editor/src/functions/takeScreenshot'
import { EditorHelperState, PlacementMode } from '@ir-engine/editor/src/services/EditorHelperState'
import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { ColliderAtomsMd, RulerUnitsMd, ScreenshotMenuMd } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuMousePointerClick, LuMove3D } from 'react-icons/lu'

export default function SceneHelpersTool() {
  const { t } = useTranslation()
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)
  const [pointClickEnabled] = useFeatureFlags([FeatureFlags.Studio.UI.PointClick])

  return (
    <div className="flex items-center gap-1 rounded bg-[#0E0F11]">
      {pointClickEnabled && (
        <>
          <Tooltip content={t('editor:toolbar.placement.click')}>
            <ViewportButton
              onClick={() => editorHelperState.placementMode.set(PlacementMode.CLICK)}
              selected={editorHelperState.placementMode.value === PlacementMode.CLICK}
            >
              <LuMousePointerClick className="text-theme-input" />
            </ViewportButton>
          </Tooltip>
          <Tooltip content={t('editor:toolbar.placement.drag')}>
            <ViewportButton
              onClick={() => editorHelperState.placementMode.set(PlacementMode.DRAG)}
              selected={editorHelperState.placementMode.value === PlacementMode.DRAG}
            >
              <LuMove3D className="text-theme-input" />
            </ViewportButton>
          </Tooltip>
        </>
      )}
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-helpers')}
        content={t('editor:toolbar.helpersToggle.info-helpers')}
      >
        <ViewportButton
          onClick={() => rendererState.physicsDebug.set(!rendererState.physicsDebug.value)}
          selected={rendererState.physicsDebug.value}
        >
          <RulerUnitsMd />
        </ViewportButton>
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeHelpers')}
        content={t('editor:toolbar.helpersToggle.info-nodeHelpers')}
      >
        <ViewportButton
          onClick={() => rendererState.nodeHelperVisibility.set(!rendererState.nodeHelperVisibility.value)}
          selected={rendererState.nodeHelperVisibility.value}
        >
          <ColliderAtomsMd />
        </ViewportButton>
      </Tooltip>
      <Tooltip title={t('editor:toolbar.sceneScreenshot.lbl')} content={t('editor:toolbar.sceneScreenshot.info')}>
        <ViewportButton onClick={() => downloadScreenshot()}>
          <ScreenshotMenuMd />
        </ViewportButton>
      </Tooltip>
    </div>
  )
}
