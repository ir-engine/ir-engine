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

import { downloadScreenshot } from '@etherealengine/editor/src/functions/takeScreenshot'
import { EditorHelperState, PlacementMode } from '@etherealengine/editor/src/services/EditorHelperState'
import { useMutableState } from '@etherealengine/hyperflux'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LuMousePointerClick, LuMove3D } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import { InfoTooltip } from '../../../layout/Tooltip'
import ColliderAtomsSvg from './icons/collider_atoms.svg?react'
import RulerSvg from './icons/ruler.svg?react'
import ScreenshotSvg from './icons/screenshot.svg?react'

export default function SceneHelpersTool() {
  const { t } = useTranslation()
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)

  return (
    <div className="flex items-center gap-1">
      <Tooltip title={t('editor:toolbar.placement.click')}>
        <Button
          startIcon={<LuMousePointerClick />}
          onClick={() => editorHelperState.placementMode.set(PlacementMode.CLICK)}
          variant={editorHelperState.placementMode.value === PlacementMode.CLICK ? 'outline' : 'transparent'}
          className="px-0"
        />
      </Tooltip>
      <Tooltip title={t('editor:toolbar.placement.drag')}>
        <Button
          startIcon={<LuMove3D />}
          onClick={() => editorHelperState.placementMode.set(PlacementMode.DRAG)}
          variant={editorHelperState.placementMode.value === PlacementMode.DRAG ? 'outline' : 'transparent'}
          className="px-0"
        />
      </Tooltip>
      <InfoTooltip
        title={t('editor:toolbar.helpersToggle.lbl-helpers')}
        info={t('editor:toolbar.helpersToggle.info-helpers')}
      >
        <Button
          startIcon={<RulerSvg />}
          onClick={() => rendererState.physicsDebug.set(!rendererState.physicsDebug.value)}
          variant={rendererState.physicsDebug.value ? 'outline' : 'transparent'}
          title={t('editor:toolbar.helpersToggle.lbl-helpers')}
          className={twMerge('px-0', rendererState.physicsDebug.value && 'border border-solid border-transparent')}
        />
      </InfoTooltip>
      <InfoTooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeHelpers')}
        info={t('editor:toolbar.helpersToggle.info-nodeHelpers')}
      >
        <Button
          startIcon={<ColliderAtomsSvg />}
          onClick={() => rendererState.nodeHelperVisibility.set(!rendererState.nodeHelperVisibility.value)}
          variant={rendererState.nodeHelperVisibility.value ? 'outline' : 'transparent'}
          title={t('editor:toolbar.helpersToggle.lbl-nodeHelpers')}
          className={twMerge(
            'px-0',
            rendererState.nodeHelperVisibility.value && 'border border-solid border-transparent'
          )}
        />
      </InfoTooltip>
      <InfoTooltip title={t('editor:toolbar.sceneScreenshot.lbl')} info={t('editor:toolbar.sceneScreenshot.info')}>
        <Button
          startIcon={<ScreenshotSvg />}
          onClick={() => downloadScreenshot()}
          variant="transparent"
          title={t('editor:toolbar.sceneScreenshot.lbl')}
          className="border border-solid border-transparent px-0"
        />
      </InfoTooltip>
    </div>
  )
}
