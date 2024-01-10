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

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

import { ErrorComponentType } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import Tooltip from '../layout/Tooltip'
import styles from './styles.module.scss'

const issueIconStyles = {
  width: '16px',
  height: 'auto',
  fontSize: 'inherit',
  color: '#ff0000'
}

export function NodeIssuesIcon({ errors }: { errors: ErrorComponentType }) {
  const { t } = useTranslation()

  const renderTooltipInfo = () => {
    let errorDetails: string[] = []

    Object.entries(errors).forEach(([componentName, errorDetail]) => {
      Object.entries(errorDetail).forEach(([errorKey, errorValue]) => {
        errorDetails.push(
          errorValue ? `${componentName} (${errorKey}): ${errorValue}` : `${componentName}: ${errorKey}`
        )
      })
    })

    return (
      <div className={styles.issuesTooltipContainer}>
        <span className={styles.issuesTooltipHeading}>{t('editor:hierarchy.issues')}</span>
        {errorDetails.map((errorDetail) => (
          <div style={{ marginTop: '0.5rem' }}>{errorDetail}</div>
        ))}
      </div>
    )
  }

  return (
    <Tooltip title={renderTooltipInfo()}>
      <ErrorOutlineIcon style={issueIconStyles} />
    </Tooltip>
  )
}

export default NodeIssuesIcon
