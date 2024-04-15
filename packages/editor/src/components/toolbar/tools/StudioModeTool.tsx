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

import { useHookstate } from '@hookstate/core'
import React from 'react'

import { getMutableState } from '@etherealengine/hyperflux'

import AdjustIcon from '@mui/icons-material/Adjust'

import { StudioMode, StudioModeType } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'
import { EditorHelperState } from '../../../services/EditorHelperState'
import SelectInput from '../../inputs/SelectInput'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const modeToggleOptions = [
  {
    label: t('editor:toolbar.studioModeToggle.lbl-advanced'),
    info: t('editor:toolbar.studioModeToggle.info-advanced'),
    value: StudioMode.Advanced
  },
  {
    label: t('editor:toolbar.studioModeToggle.lbl-simple'),
    info: t('editor:toolbar.studioModeToggle.info-simple'),
    value: StudioMode.Simple
  }
]

const studioModeToggleTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const settoggleMode = (mode: StudioModeType): void => {
    getMutableState(EditorHelperState).studioMode.set(mode)
  }
  const toggleMode = () => {
    getMutableState(EditorHelperState).studioMode.set((mode) =>
      mode === StudioMode.Advanced ? StudioMode.Simple : StudioMode.Advanced
    )
  }
  return (
    <div className={styles.toolbarInputGroup} id="modeToggle">
      <InfoTooltip title={t('editor:toolbar.modeToggle')}>
        <button onClick={toggleMode as any} className={styles.toolButton}>
          <AdjustIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <SelectInput
        key={editorHelperState.studioMode.value}
        className={styles.selectInput}
        onChange={settoggleMode}
        options={modeToggleOptions}
        value={editorHelperState.studioMode.value}
        creatable={false}
        isSearchable={false}
      />
    </div>
  )
}

export default studioModeToggleTool
