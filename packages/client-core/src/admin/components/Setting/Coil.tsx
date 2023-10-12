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

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { coilSettingPath } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'
import styles from '../../styles/settings.module.scss'

const Coil = () => {
  const { t } = useTranslation()
  const coil = useFind(coilSettingPath).data.at(0)

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.coil')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputText
            name="clientId"
            label={t('admin:components.setting.clientId')}
            value={coil?.clientId || ''}
            disabled
          />

          <InputText
            name="clientSecret"
            label={t('admin:components.setting.clientSecret')}
            value={coil?.clientSecret || ''}
            disabled
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputText
            name="paymentPointer"
            label={t('admin:components.setting.coilPaymentPointer')}
            value={coil?.paymentPointer || ''}
            disabled
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Coil
