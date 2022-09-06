import React from 'react'
import { useTranslation } from 'react-i18next'

import { dispatchAction } from '@xrengine/hyperflux'

import { EditorAction, useEditorState } from '../../../services/EditorServices'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const AdvancedModeTool = () => {
  const editorState = useEditorState()
  const { t } = useTranslation()
  return (
    <div className={styles.toolbarInputGroup}>
      <InfoTooltip title={t('editor:toolbar.info-advanced')} placement="bottom">
        <button
          style={{ width: 'auto' }}
          className={styles.toolButton + ' ' + (editorState.advancedMode.value ? styles.selected : '')}
          onClick={() => dispatchAction(EditorAction.setAdvancedMode({ advanced: !editorState.advancedMode.value }))}
        >
          {t('editor:toolbar.lbl-advanced')}
        </button>
      </InfoTooltip>
    </div>
  )
}

export default AdvancedModeTool
