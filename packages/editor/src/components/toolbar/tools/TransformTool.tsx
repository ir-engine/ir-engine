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

import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import HeightIcon from '@mui/icons-material/Height'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import SyncIcon from '@mui/icons-material/Sync'

import { useTranslation } from 'react-i18next'
import { setTransformMode } from '../../../functions/transformFunctions'
import { EditorHelperState } from '../../../services/EditorHelperState'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const TransformTool = () => {
  const { t } = useTranslation()

  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const transformMode = editorHelperState.transformMode.value

  return (
    <InfoTooltip title={t('editor:toolbar.gizmo.description')} placement="right">
      <div className={styles.toolbarInputGroup}>
        <InfoTooltip title={t('editor:toolbar.gizmo.translate')} placement="bottom">
          <button
            className={styles.toolButton + ' ' + (transformMode === TransformMode.translate ? styles.selected : '')}
            onClick={() => setTransformMode(TransformMode.translate)}
          >
            <OpenWithIcon fontSize="small" />
          </button>
        </InfoTooltip>
        <InfoTooltip title={t('editor:toolbar.gizmo.rotate')} placement="bottom">
          <button
            className={styles.toolButton + ' ' + (transformMode === TransformMode.rotate ? styles.selected : '')}
            onClick={() => setTransformMode(TransformMode.rotate)}
          >
            <SyncIcon fontSize="small" />
          </button>
        </InfoTooltip>
        <InfoTooltip title={t('editor:toolbar.gizmo.scale')} placement="bottom">
          <button
            className={styles.toolButton + ' ' + (transformMode === TransformMode.scale ? styles.selected : '')}
            onClick={() => setTransformMode(TransformMode.scale)}
          >
            <HeightIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </InfoTooltip>
  )
}

export default TransformTool
