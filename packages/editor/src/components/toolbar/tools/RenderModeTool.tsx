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

import { t } from 'i18next'
import React, { useState } from 'react'

import { ShadowMapResolutionOptions } from '@etherealengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { RenderModes, RenderModesType } from '@etherealengine/engine/src/renderer/constants/RenderModes'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import BooleanInput from '../../inputs/BooleanInput'
import InputGroup from '../../inputs/InputGroup'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const rendererState = useHookstate(getMutableState(RendererState))
  const options = [] as { label: string; value: string }[]

  const [isVisible, setIsVisible] = useState(false)

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const toggleRenderSettings = () => {
    setIsVisible(!isVisible)
  }

  const onChangeRenderMode = (mode: RenderModesType) => {
    rendererState.renderMode.set(mode)
  }

  const handlePostProcessingCheckbox = () => {
    rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
    rendererState.automatic.set(false)
  }
  return (
    <>
      <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="stats">
        <InfoTooltip title="Render Settings">
          <button
            onClick={toggleRenderSettings}
            className={styles.toolButton + ' ' + (isVisible ? styles.selected : '')}
          >
            <WbSunnyOutlinedIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
      {isVisible && (
        <div className={styles.settingsContainer}>
          <InputGroup
            name="Use Post Processing"
            label={t('editor:toolbar.render-settings.lbl-usePostProcessing')}
            info={t('editor:toolbar.render-settings.info-usePostProcessing')}
          >
            <BooleanInput value={rendererState.usePostProcessing.value} onChange={handlePostProcessingCheckbox} />
          </InputGroup>
          <InputGroup
            name="Render Mode"
            label={t('editor:toolbar.render-settings.lbl-renderMode')} // need to figure out where this goes, maybe make a new section in editor.json, HELP!
            info={t('editor:toolbar.render-settings.info-renderMode')}
          >
            <SelectInput
              key={rendererState.renderMode.value}
              className={styles.selectInput}
              onChange={onChangeRenderMode}
              options={options}
              value={rendererState.renderMode.value}
              creatable={false}
              isSearchable={false}
            />
          </InputGroup>
          {rendererState.renderMode.value == RenderModes.SHADOW && (
            <InputGroup
              name="Shadow Map Resolution"
              label={t('editor:toolbar.render-settings.lbl-shadowMapResolution')}
              info={t('editor:toolbar.render-settings.info-shadowMapResolution')}
            >
              <SelectInput
                options={ShadowMapResolutionOptions}
                value={rendererState.shadowMapResolution.value}
                onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
              />
            </InputGroup>
          )}
        </div>
      )}
    </>
  )
}

export default RenderModeTool
