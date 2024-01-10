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

import { Tooltip, TooltipProps } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles<any, any, any>((theme: any) => {
  return createStyles({
    tooltip: {
      background: theme.panel
    }
  })
})

/**
 * @param {Object} props
 * @param {string} props.info additional info added to the tooltip label
 */
export function InfoTooltip(props: TooltipProps & { info?: string }) {
  if (!props.title) return <>{props.children}</>

  const title = props.info ? (
    <p>
      {props.title}
      <hr />
      {props.info}
    </p>
  ) : (
    props.title
  )

  const styles = useStyles({})

  return (
    <Tooltip {...props} title={title} classes={{ tooltip: styles.tooltip }} arrow disableInteractive>
      {/* Span is required to trigger events like hover in safari for disabled elements */}
      <span>{props.children}</span>
    </Tooltip>
  )
}

export default Tooltip
