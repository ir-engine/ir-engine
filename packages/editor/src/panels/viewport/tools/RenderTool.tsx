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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RenderModes, RenderModesType } from '@ir-engine/spatial/src/renderer/constants/RenderModes'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { GlobeWireframesMd, LitMd, NormalRenderMd, ShadowMd, UnlitMd } from '@ir-engine/ui/src/icons'
import { OptionType } from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import ToolbarDropdown from './ToolbarDropdown'

const renderModes: OptionType[] = [
  {
    label: 'Unlit',
    Icon: UnlitMd as OptionType['Icon'],
    value: RenderModes.UNLIT
  },
  {
    label: 'Lit',
    Icon: LitMd as OptionType['Icon'],
    value: RenderModes.LIT
  },
  {
    label: 'Normals',
    Icon: NormalRenderMd as OptionType['Icon'],
    value: RenderModes.NORMALS
  },
  {
    label: 'Wireframe',
    Icon: GlobeWireframesMd as OptionType['Icon'],
    value: RenderModes.WIREFRAME
  }
]

const renderModeIcons = {
  [RenderModes.UNLIT]: UnlitMd,
  [RenderModes.LIT]: LitMd,
  [RenderModes.NORMALS]: NormalRenderMd,
  [RenderModes.WIREFRAME]: GlobeWireframesMd,
  [RenderModes.SHADOW]: ShadowMd
}

const RenderModeTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)

  const dropdownValue =
    rendererState.renderMode.value === RenderModes.SHADOW ? RenderModes.LIT : rendererState.renderMode.value
  return (
    <div className="flex items-center gap-x-3">
      <Tooltip position={'right'} content={t('editor:toolbar.render-settings.info-renderMode')}>
        <Text className={'text-nowrap dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.render-settings.lbl-renderMode')}
        </Text>
      </Tooltip>
      <ToolbarDropdown
        tooltipContent={t('editor:toolbar.render-settings.lbl-renderMode')}
        tooltipPosition="right"
        onChange={(value: RenderModesType) => rendererState.renderMode.set(value)}
        options={renderModes}
        value={dropdownValue}
        width="full"
        inputHeight="xs"
        dropdownParentClassName="w-[8rem]"
      />
      <Tooltip content={t('editor:toolbar.render-settings.lbl-shadows')} position="bottom">
        <ViewportButton
          lean={true}
          selected={rendererState.renderMode.value === RenderModes.SHADOW}
          onClick={() => rendererState.renderMode.set(RenderModes.SHADOW)}
          icon={ShadowMd}
        />
      </Tooltip>
    </div>
  )
}

export default RenderModeTool
