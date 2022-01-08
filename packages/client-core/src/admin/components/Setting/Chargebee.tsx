import React, { useEffect } from 'react'

import { Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'

import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { ChargebeeSettingService } from '../../services/Setting/ChargebeeSettingService'
import { useChargebeeSettingState } from '../../services/Setting/ChargebeeSettingService'
import { useStyles } from './styles'

interface Props {}

const ChargeBee = (props: Props) => {
  const classes = useStyles()
  const chargeBeeSettingState = useChargebeeSettingState()
  const [chargebee] = chargeBeeSettingState?.chargebee.value || []
  const dispatch = useDispatch()
  const authState = useAuthState()
  const user = authState.user

  useEffect(() => {
    if (user?.id?.value != null && chargeBeeSettingState?.updateNeeded?.value) {
      ChargebeeSettingService.fetchChargeBee()
    }
  }, [authState?.user?.id?.value, chargeBeeSettingState?.updateNeeded?.value])

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          {' '}
          CHARGEBEE
        </Typography>
        <Paper component="div" className={classes.createInput}>
          <label>URL:</label>
          <InputBase
            value={chargebee?.url || ''}
            name="url"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>ApiKey:</label>
          <InputBase
            value={chargebee?.apiKey || ''}
            name="apiKey"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
      </form>
    </div>
  )
}

export default ChargeBee
