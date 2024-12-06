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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { ShadowMapResolutionOptions } from '@ir-engine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RenderModes, RenderModesType } from '@ir-engine/spatial/src/renderer/constants/RenderModes'
import { Checkbox, Tooltip } from '@ir-engine/ui'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import { ChevronDownMd, GlobeWireframesMd, LitMd, NormalRenderMd, ShadowMd, UnlitMd } from '@ir-engine/ui/src/icons'

const renderModes: { name: RenderModesType; icon: JSX.Element }[] = [
  {
    name: 'Unlit',
    icon: <UnlitMd className="text-[#9CA0AA]" />
  },
  {
    name: 'Lit',
    icon: <LitMd className="text-[#9CA0AA]" />
  },
  { name: 'Normals', icon: <NormalRenderMd className="text-[#9CA0AA]" /> },
  {
    name: 'Wireframe',
    icon: <GlobeWireframesMd className="text-[#9CA0AA]" />
  },
  {
    name: 'Shadows',
    icon: <ShadowMd className="text-[#9CA0AA]" />
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
    <div className="flex items-center gap-1 rounded bg-[#141619]">
      {renderModes.map((mode) => (
        <Tooltip key={mode.name} content={mode.name}>
          <button onClick={() => rendererState.renderMode.set(mode.name)} className="p-1">
            {mode.icon}
          </button>
        </Tooltip>
      ))}
      <Popup
        keepInside
        trigger={
          <button className="p-2">
            <ChevronDownMd />
          </button>
        }
      >
        <div className="w-52 rounded-md bg-theme-primary p-2">
          <InputGroup
            name="Use Post Processing"
            label={t('editor:toolbar.render-settings.lbl-usePostProcessing')}
            info={t('editor:toolbar.render-settings.info-usePostProcessing')}
            containerClassName="justify-between"
            className="w-8"
          >
            <Checkbox checked={rendererState.usePostProcessing.value} onChange={handlePostProcessingChange} />
          </InputGroup>
          <InputGroup
            name="Shadow Map Resolution"
            label={t('editor:toolbar.render-settings.lbl-shadowMapResolution')}
            info={t('editor:toolbar.render-settings.info-shadowMapResolution')}
            containerClassName="justify-between gap-2"
          >
            <SelectInput
              options={ShadowMapResolutionOptions as { value: string; label: string }[]}
              value={rendererState.shadowMapResolution.value}
              onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
              disabled={rendererState.renderMode.value !== RenderModes.SHADOW}
              width="full"
            />
          </InputGroup>
        </div>
      </Popup>
    </div>
  )
}

export default RenderModeTool
