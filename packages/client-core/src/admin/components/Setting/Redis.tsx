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

import React from 'react'
import { useTranslation } from 'react-i18next'

import InputSwitch from '@etherealengine/client-core/src/common/components/InputSwitch'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { redisSettingPath } from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'
import styles from '../../styles/settings.module.scss'

const Redis = () => {
  const { t } = useTranslation()
  const redisSetting = useFind(redisSettingPath).data.at(0)
  const enabled = useHookstate(true)

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.redis')}
      </Typography>
      <InputSwitch
        name="enabled"
        sx={{ mb: 2 }}
        label={t('admin:components.setting.enabled')}
        checked={enabled.value}
        disabled
        onChange={(event) => enabled.set(event.target.checked)}
      />
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText
            name="address"
            label={t('admin:components.setting.address')}
            value={redisSetting?.address || ''}
            disabled
          />

          <InputText name="port" label={t('admin:components.setting.port')} value={redisSetting?.port || ''} disabled />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="password"
            label={t('admin:components.setting.password')}
            value={redisSetting?.password || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Redis
