import React from 'react'
import { Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'

const ChargeBee = () => {
  const classes = useStyles()

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          {' '}
          CHARGEBEE
        </Typography>
        <Paper component="div" className={classes.createInput}>
          <label>URL:</label>
          <InputBase name="url" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>ApiKey:</label>
          <InputBase name="apikey" className={classes.input} disabled style={{ color: '#fff' }} />
        </Paper>
      </form>
    </div>
  )
}

export default ChargeBee
