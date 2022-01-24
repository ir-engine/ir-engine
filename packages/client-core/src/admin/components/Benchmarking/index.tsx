import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useStyles } from './styles'
import { TestBotService, useTestBotState } from '../../services/TestBotService'

const Benchmarking = () => {
  const testbotState = useTestBotState()
  const classes = useStyles()
  const bots = testbotState.value.bots

  const REFRESH_MS = 10000

  useEffect(() => {
    TestBotService.fetchTestBot()
    const interval = setInterval(() => {
      console.log('Refreshing bot status')
      TestBotService.fetchTestBot()
    }, REFRESH_MS)

    return () => clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Button type="button" variant="contained" color="primary">
            {'Spawn Bots'}
          </Button>
        </Grid>
      </Grid>

      {bots && bots.length > 0 && (
        <Typography className={classes.secondaryHeading}>
          Last run status: {bots[0].status} (auto refreshing in 10s)
        </Typography>
      )}
    </div>
  )
}

export default Benchmarking
