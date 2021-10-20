import React from 'react'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import DisplayBots from './displayBots'
import { Face, List } from '@material-ui/icons'
import { useStylesForBots as useStyles } from './styles'
import CreateBot from './CreateBot'

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
                <List style={{ paddingTop: '5px' }} /> <span style={{ marginLeft: '10px' }}> Creator bots </span>
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
