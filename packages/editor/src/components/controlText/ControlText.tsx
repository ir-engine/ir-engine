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
import { useTranslation } from 'react-i18next'

import { getMutableState } from '@etherealengine/hyperflux'

import { EditorHelperState } from '../../services/EditorHelperState'
import { SelectionState } from '../../services/SelectionServices'
import styles from './styles.module.scss'

/**
 * ControlText used to render viewport.
 *
 * @constructor
 */
export function ControlText() {
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const { t } = useTranslation()

  const selectionState = useHookstate(getMutableState(SelectionState))
  const objectSelected = selectionState.selectedEntities.length > 0

  let controlsText

  if (editorHelperState.isFlyModeEnabled.value) {
    controlsText =
      '[W][A][S][D] ' + t('editor:viewport.command.movecamera') + ' | [Shift] ' + t('editor:viewport.command.flyFast')
  } else {
    controlsText =
      '[LMB] ' +
      t('editor:viewport.command.orbit') +
      ' | [MMB] ' +
      t('editor:viewport.command.pan') +
      ' | [RMB] ' +
      t('editor:viewport.command.fly')
  }

  if (objectSelected) {
    controlsText +=
      ' | [F] ' +
      t('editor:viewport.command.focus') +
      ' | [Q] ' +
      t('editor:viewport.command.rotateLeft') +
      ' | [E] ' +
      t('editor:viewport.command.rotateRight')
  }
  if (objectSelected) {
    controlsText += ' | [ESC] ' + t('editor:viewport.command.deselectAll')
  }
  return <div className={styles.controlsText}>{controlsText}</div>
}
