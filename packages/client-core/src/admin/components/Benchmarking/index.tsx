import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import multiLogger from '@etherealengine/common/src/logger'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/Button'
import Grid from '@etherealengine/ui/src/Grid'
import Typography from '@etherealengine/ui/src/Typography'

import { AdminTestBotState, TestBotService } from '../../services/TestBotService'
import styles from '../../styles/admin.module.scss'

const logger = multiLogger.child({ component: 'client-core:bot:benchmarking' })

const Benchmarking = () => {
  const testbotState = useHookstate(getMutableState(AdminTestBotState))
  const { bots, spawn, spawning } = testbotState.get({ noproxy: true })
  const { t } = useTranslation()
  const REFRESH_MS = 10000

  useEffect(() => {
    TestBotService.fetchTestBot()
    const interval = setInterval(() => {
      logger.info('Refreshing bot status.')
      TestBotService.fetchTestBot()
    }, REFRESH_MS)

    return () => clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [])

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={4}>
          <Button
            type="button"
            variant="contained"
            className={styles.openModalBtn}
            disabled={spawning}
            onClick={() => {
              TestBotService.spawnTestBot()
            }}
          >
            {t('admin:components.bot.spawnBot')}
          </Button>
        </Grid>
      </Grid>

      {spawn && <Typography className={styles.heading}>Spawn bot status: {spawn.message}</Typography>}

      {bots && bots.length > 0 && (
        <Typography className={styles.secondaryHeading}>
          {t('admin:components.bot.lastRunStatus')}: {bots[0].status} ({t('admin:components.bot.autoRefreshing')})
        </Typography>
      )}
    </div>
  )
}

export default Benchmarking
