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
import { useMutableState } from '@etherealengine/hyperflux'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { RenderModes, RenderModesType } from '@etherealengine/spatial/src/renderer/constants/RenderModes'
import { GiWireframeGlobe } from 'react-icons/gi'
import { RiArrowDownSLine } from 'react-icons/ri'
import { TbBallBowling, TbInnerShadowBottom, TbInnerShadowBottomFilled, TbShadow } from 'react-icons/tb'
import Button from '../../../../../primitives/tailwind/Button'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import { Popup } from '../../../../tailwind/Popup'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'

const renderModes: { name: RenderModesType; icon: JSX.Element }[] = [
  {
    name: 'Unlit',
    icon: <TbInnerShadowBottomFilled className="text-theme-input" />
  },
  {
    name: 'Lit',
    icon: <TbInnerShadowBottom className="text-theme-input" />
  },
  { name: 'Normals', icon: <TbBallBowling className="text-theme-input" /> },
  {
    name: 'Wireframe',
    icon: <GiWireframeGlobe className="text-theme-input" />
  },
  {
    name: 'Shadows',
    icon: <TbShadow className="text-theme-input" />
  }
]

const RenderModeTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const handlePostProcessingChange = () => {
    rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
    rendererState.automatic.set(false)
  }

  return (
    <div className="flex items-center gap-1">
      {renderModes.map((mode) => (
        <Tooltip key={mode.name} title={mode.name}>
          <Button
            startIcon={mode.icon}
            variant={rendererState.renderMode.value === mode.name ? 'outline' : 'transparent'}
            onClick={() => rendererState.renderMode.set(mode.name)}
            className="p-2"
          />
        </Tooltip>
      ))}
      <Popup trigger={<Button variant="transparent" className="p-2" startIcon={<RiArrowDownSLine />} />}>
        <div className="w-60 rounded-md p-2">
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
              inputClassName="text-theme-gray3"
              className="border-theme-input text-theme-gray3"
              options={ShadowMapResolutionOptions as { value: string; label: string }[]}
              value={rendererState.shadowMapResolution.value}
              onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
              disabled={rendererState.renderMode.value !== RenderModes.SHADOW}
            />
          </InputGroup>
        </div>
      </Popup>
    </div>
  )
}

export default RenderModeTool
