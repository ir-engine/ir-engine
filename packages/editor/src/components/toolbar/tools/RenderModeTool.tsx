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

import { RenderModesType } from '@etherealengine/engine/src/renderer/constants/RenderModes'
import { RenderModes } from '@etherealengine/engine/src/renderer/constants/RenderModes'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const RenderModeTool = () => {
  const rendererState = useHookstate(getMutableState(RendererState))
  const options = [] as { label: string; value: string }[]

  for (let key of Object.keys(RenderModes)) {
    options.push({
      label: RenderModes[key],
      value: RenderModes[key]
    })
  }

  const onChangeRenderMode = (mode: RenderModesType) => {
    rendererState.renderMode.set(mode)
  }

  return (
    <div className={styles.toolbarInputGroup} id="transform-pivot">
      <InfoTooltip title="Render Mode">
        <div className={styles.toolIcon}>
          <WbSunnyOutlinedIcon fontSize="small" />
        </div>
      </InfoTooltip>
      <SelectInput
        key={rendererState.renderMode.value}
        className={styles.selectInput}
        onChange={onChangeRenderMode}
        options={options}
        value={rendererState.renderMode.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default RenderModeTool
