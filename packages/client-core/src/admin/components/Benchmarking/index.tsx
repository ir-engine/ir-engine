import React, { useEffect } from 'react'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { TestBotService, useTestBotState } from '../../services/TestBotService'
import { useTranslation } from 'react-i18next'
import { useStyles } from './styles'

const Benchmarking = () => {
  const testbotState = useTestBotState()
  const classes = useStyles()
  const { bots, spawn, spawning } = testbotState.value
  const { t } = useTranslation()
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
          <Button
            type="button"
            variant="contained"
            color="primary"
            disabled={spawning}
            onClick={() => {
              TestBotService.spawnTestBot()
            }}
          >
            {t('admin:components.bot.spawnBot')}
          </Button>
        </Grid>
      </Grid>

      {spawn && <Typography className={classes.heading}>Spawn bot status: {spawn.message}</Typography>}

      {bots && bots.length > 0 && (
        <Typography className={classes.secondaryHeading}>
          {t('admin:components.bot.lastRunStatus')}: {bots[0].status} ({t('admin:components.bot.autoRefreshing')})
        </Typography>
      )}
    </div>
  )
}

export default Benchmarking
