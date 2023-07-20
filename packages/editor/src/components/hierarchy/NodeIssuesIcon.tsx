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

import React, { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

import Tooltip from '../layout/Tooltip'

/**
 * IssuesTooltipContainer used to provide styles and showing issues list.
 *
 * @type {styled component}
 */
const IssuesTooltipContainer = (styled as any).div`
  display: inline-block;
  pointer-events: none;
  background-color: rgba(21, 23, 27, 0.9);
  border-radius: 3px;
  padding: 8px;
  max-width: 320px;
  overflow: hidden;
  overflow-wrap: break-word;
  user-select: none;

  h6 {
    font-size: 14px;
  }

  ul {
    margin-top: 4px;
  }

  li {
    margin-bottom: 4px;
    margin-left: 4px;
    font-family: 'Lucida Console', Monaco, monospace;
    font-size: 12px;
  }
`

/**
 * IssueIcon used to provide styles to issue icon.
 *
 * @param {styled component} styled
 */
const IssueIcon = (styled as any)(ErrorOutlineIcon)`
  width: 16px;
  height: auto;
  font-size: inherit;
  color: ${(props) => props.color};
`

/**
 * NodeIssuesIcon function component used to provide view of issues list.
 *
 * @param       {function component} node
 * @constructor
 */
export function NodeIssuesIcon({ node }) {
  const { t } = useTranslation()

  const severityToColor = {
    warning: 'yellow',
    error: 'red'
  }

  /**
   * renderInfo function used to return view.
   *
   * @type {function}
   */
  const renderInfo = useCallback(() => {
    return (
      <IssuesTooltipContainer>
        <h6>{t('editor:hierarchy.isseus')}</h6>
        <ul>
          {node.map((issue, i) => {
            return (
              <li key={i}>
                <IssueIcon size={12} color={severityToColor[issue.severity]} /> {issue.message}
              </li>
            )
          })}
        </ul>
      </IssuesTooltipContainer>
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
      <IssueIcon color={severityToColor[maxSeverity]} />
    </Tooltip>
  )
}

export default NodeIssuesIcon
