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
import { useTranslation } from 'react-i18next'

import { ShadowMapResolutionOptions } from '@etherealengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { RenderModes, RenderModesType } from '@etherealengine/spatial/src/renderer/constants/RenderModes'
import { GiWireframeGlobe } from 'react-icons/gi'
import { RiArrowDownSLine } from 'react-icons/ri'
import { TbBallBowling, TbInnerShadowBottom, TbInnerShadowBottomFilled, TbShadow } from 'react-icons/tb'
import { ViewportPanelTab } from '..'
import Button from '../../../../../primitives/tailwind/Button'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'
import PopOverMenu from '../../../layout/PopOverMenu'

const renderModes: { name: RenderModesType; icon: JSX.Element }[] = [
  {
    name: 'Unlit',
    icon: <TbInnerShadowBottomFilled />
  },
  {
    name: 'Lit',
    icon: <TbInnerShadowBottom />
  },
  { name: 'Normals', icon: <TbBallBowling /> },
  {
    name: 'Wireframe',
    icon: <GiWireframeGlobe />
  },
  {
    name: 'Shadows',
    icon: <TbShadow />
  }
]

const RenderModeTool = () => {
  const { t } = useTranslation()
  const anchorEl = useHookstate<HTMLElement | null>(null)
  const anchorPosition = useHookstate({ left: 0, top: 0 })

  const rendererState = useMutableState(RendererState)
  const options = [] as { label: string; value: string }[]
  const isVisible = useHookstate(false)

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const onChangeRenderMode = (mode: RenderModesType) => {
    rendererState.renderMode.set(mode)
  }

  const handlePostProcessingChange = () => {
    rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
    rendererState.automatic.set(false)
  }

  return (
    <div className="flex items-center gap-1">
      {renderModes.map((mode) => (
        <Tooltip key={mode.name} title={mode.name} direction="bottom">
          <Button
            startIcon={mode.icon}
            variant={rendererState.renderMode.value === mode.name ? 'outline' : 'transparent'}
            onClick={() => rendererState.renderMode.set(mode.name)}
            className="p-2"
          />
        </Tooltip>
      ))}
      <Button
        variant="transparent"
        className="p-2"
        onClick={(event) => {
          anchorEl.set(event.currentTarget)
          anchorPosition.set({ left: event.clientX, top: event.clientY + 10 })
        }}
        startIcon={<RiArrowDownSLine />}
        id="render-settings-menu"
      />
      <PopOverMenu
        open={!!anchorEl}
        anchorEl={anchorEl.value as HTMLElement}
        anchorPosition={anchorPosition.value}
        panelId={ViewportPanelTab.id!}
        onClose={() => anchorEl.set(null)}
        className="w-60 p-2"
      >
        <InputGroup
          name="Use Post Processing"
          label={t('editor:toolbar.render-settings.lbl-usePostProcessing')}
          info={t('editor:toolbar.render-settings.info-usePostProcessing')}
        >
          <BooleanInput
            className="bg-gray-500 hover:border-0"
            value={rendererState.usePostProcessing.value}
            onChange={handlePostProcessingChange}
          />
        </InputGroup>
        <InputGroup
          name="Shadow Map Resolution"
          label={t('editor:toolbar.render-settings.lbl-shadowMapResolution')}
          info={t('editor:toolbar.render-settings.info-shadowMapResolution')}
        >
          <SelectInput
            options={ShadowMapResolutionOptions as { value: string; label: string }[]}
            value={rendererState.shadowMapResolution.value}
            onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
            disabled={rendererState.renderMode.value !== RenderModes.SHADOW}
          />
        </InputGroup>
      </PopOverMenu>
    </div>
  )
}

export default RenderModeTool
