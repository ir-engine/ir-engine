import React from 'react'

import { List } from '@mui/icons-material'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import CreateBot from './CreateBot'
import DisplayBots from './displayBots'
import { useStylesForBots as useStyles } from './styles'

const Bots = () => {
  const classes = useStyles()
  return (
    <div>
      <Grid container={true} spacing={4}>
        <Grid item xs={12} md={6} sm={12}>
          <CreateBot />
        </Grid>

        <Grid item xs={12} md={6} sm={12}>
          <Card className={classes.root}>
            <Paper className={classes.header}>
              <Typography className={classes.title}>
                <List style={{ paddingTop: '5px' }} /> <span style={{ marginLeft: '10px' }}> XREngine bots </span>
              </Typography>
            </Paper>
            <DisplayBots />
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default Bots
