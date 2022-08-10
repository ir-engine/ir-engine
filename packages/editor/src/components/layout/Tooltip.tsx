import React from 'react'

import { createStyles, Tooltip, TooltipProps } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles<any, {}, any>((theme: any) => {
  return createStyles({
    tooltip: {
      background: theme.panel
    }
  })
})

/**
 *
 * @param {any} info
 * @param {any} children
 * @param {any} rest
 * @returns
 */
export function InfoTooltip(props: TooltipProps) {
  if (!props.title) return <>{props.children}</>

  const styles = useStyles()

  return (
    <Tooltip {...props} classes={{ tooltip: styles.tooltip }} arrow disableInteractive>
      {/* Span is required to trigger events like hover in safari for disabled elements */}
      <span>{props.children}</span>
    </Tooltip>
  )
}

export default Tooltip
