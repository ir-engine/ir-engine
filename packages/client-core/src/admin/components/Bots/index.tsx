import React from 'react'
import { useTranslation } from 'react-i18next'

import Card from '@etherealengine/ui/src/primitives/mui/Card'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Paper from '@etherealengine/ui/src/primitives/mui/Paper'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import styles from '../../styles/admin.module.scss'
import CreateBot from './CreateBot'
import DisplayBots from './DisplayBots'

const Bots = () => {
  const { t } = useTranslation()

  return (
    <div>
      <Grid container={true} spacing={4}>
        <Grid item xs={12} md={6} sm={12}>
          <CreateBot />
        </Grid>
        <Grid item xs={12} md={6} sm={12}>
          <Card className={styles.botRoot}>
            <Paper className={styles.botHeader}>
              <Typography className={styles.botTitle}>
                <Icon type="List" className={styles.pTop5} />
                <span className={styles.mLeft10}> {t('admin:components.bot.engineBots')} </span>
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
