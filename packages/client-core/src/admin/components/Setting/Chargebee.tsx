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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { AuthState } from '../../../user/services/AuthService'
import { AdminChargebeeSettingsState, ChargebeeSettingService } from '../../services/Setting/ChargebeeSettingService'
import styles from '../../styles/settings.module.scss'

const ChargeBee = () => {
  const { t } = useTranslation()
  const chargeBeeSettingState = useHookstate(getMutableState(AdminChargebeeSettingsState))
  const [chargebee] = chargeBeeSettingState?.chargebee.get({ noproxy: true }) || []
  const user = useHookstate(getMutableState(AuthState).user)

  useEffect(() => {
    if (user?.id?.value != null && chargeBeeSettingState?.updateNeeded?.value) {
      ChargebeeSettingService.fetchChargeBee()
    }
  }, [user?.id?.value, chargeBeeSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.chargebee')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText name="url" label={t('admin:components.setting.url')} value={chargebee?.url || ''} disabled />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="apiKey"
            label={t('admin:components.setting.apiKey')}
            value={chargebee?.apiKey || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ChargeBee
