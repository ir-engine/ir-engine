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

import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

import Tooltip from '../layout/Tooltip'

const issuesTooltipContainerStyles = {
  display: 'inline-block',
  pointerEvents: 'none',
  backgroundColor: 'rgba(21, 23, 27, 0.9)',
  borderRadius: '3px',
  padding: '8px',
  maxWidth: '320px',
  overflow: 'hidden',
  overflowWrap: 'break-word',
  userSelect: 'none'
}

const issueIconStyles = (color): React.CSSProperties => ({
  width: '16px',
  height: 'auto',
  fontSize: 'inherit',
  color: color
})

export function NodeIssuesIcon({ node }) {
  const theme = useMemo(
    () => ({
      yellow: '#ffcc00',
      red: '#ff0000'
      // Add other theme colors here
    }),
    []
  )
  const { t } = useTranslation()

  const severityToColor = useMemo(
    () => ({
      warning: theme.yellow,
      error: theme.red
    }),
    [theme]
  )

  const renderInfo = useCallback(() => {
    return (
      <div style={issuesTooltipContainerStyles as React.CSSProperties}>
        <h6 style={{ fontSize: '100%', fontWeight: 'normal' }}>{t('editor:hierarchy.isseus')}</h6>
        <ul style={{ listStyle: 'none' }}>
          {node.map((issue, i) => {
            return (
              <li key={i}>
                <ErrorOutlineIcon style={issueIconStyles(severityToColor[issue.severity])} fontSize="small" />{' '}
                {issue.message}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }, [node, severityToColor])

  let maxSeverity = 'warning'

  for (const issue of node) {
    if (issue.severity === 'error') {
      maxSeverity = 'error'
      break
    }
  }

  return (
    <Tooltip title={renderInfo()}>
      <ErrorOutlineIcon style={issueIconStyles(severityToColor[maxSeverity])} />
    </Tooltip>
  )
}

export default NodeIssuesIcon
