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

import GridOnIcon from '@mui/icons-material/GridOn'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useMutableState } from '@etherealengine/hyperflux'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'

import NumericStepperInput from '../../inputs/NumericStepperInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const GridTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)

  const onToggleGridVisible = () => {
    rendererState.gridVisibility.set(!rendererState.gridVisibility.value)
  }

  const onChangeGridHeight = (value) => {
    rendererState.gridHeight.set(value)
  }

  return (
    <div id="transform-grid" className={styles.toolbarInputGroup}>
      <InfoTooltip title={t('editor:toolbar.grid.info-toggleGridVisibility')}>
        <button
          onClick={onToggleGridVisible}
          className={styles.toolButton + ' ' + (rendererState.gridVisibility.value ? styles.selected : '')}
        >
          <GridOnIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <InfoTooltip title={t('editor:toolbar.grid.info-gridSpacing')} placement="right">
        <div>
          <NumericStepperInput
            style={{ width: '120px' }}
            className={styles.toolbarNumericStepperInput}
            value={rendererState.gridHeight.value}
            onChange={onChangeGridHeight}
            precision={0.01}
            smallStep={0.5}
            mediumStep={1}
            largeStep={5}
            unit="m"
            incrementTooltip={t('editor:toolbar.grid.info-incrementHeight')}
            decrementTooltip={t('editor:toolbar.grid.info-decrementHeight')}
          />
        </div>
      </InfoTooltip>
    </div>
  )
}

export default GridTool