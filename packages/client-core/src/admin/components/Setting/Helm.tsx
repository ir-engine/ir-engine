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

import InputSwitch from '@etherealengine/client-core/src/common/components/InputSwitch'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { AwsCloudFrontType, AwsSmsType } from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import InputSelect, { InputMenuItem } from '../../../common/components/InputSelect'
import { AuthState } from '../../../user/services/AuthService'
import { AwsSettingService } from '../../services/Setting/AwsSettingService'
import { AdminHelmSettingsState, HelmSettingService } from '../../services/Setting/HelmSettingService'
import styles from '../../styles/settings.module.scss'

const Helm = () => {
  const { t } = useTranslation()
  const helmSettingState = useHookstate(getMutableState(AdminHelmSettingsState))
  const [helmSetting] = helmSettingState?.helmSettings?.get({ noproxy: true }) || []
  const id = helmSetting?.id
  const helmMainVersions = helmSettingState?.mainVersions?.get({ noproxy: true }) || []
  const helmBuilderVersions = helmSettingState?.builderVersions?.get({ noproxy: true }) || []
  const user = useHookstate(getMutableState(AuthState).user)
  const selectedMainVersion = useHookstate('')
  const selectedBuilderVersion = useHookstate('')

  const handleMainVersionChange = async (e) => {
    console.log('changeMainVersion', e, e.target.value)
    selectedMainVersion.set(e.target.value)
  }
  const handleBuilderVersionChange = async (e) => {
    selectedBuilderVersion.set(e.target.value)
  }

  const mainVersionMenu: InputMenuItem[] = helmMainVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const builderVersionMenu: InputMenuItem[] = helmBuilderVersions.map((el) => {
    return {
      value: el as string,
      label: el
    }
  })

  const handleSubmit = (event) => {
    event.preventDefault()

    HelmSettingService.patchHelmSetting({ main: selectedMainVersion.value, builder: selectedBuilderVersion.value }, id)
  }

  const handleCancel = () => {
    selectedMainVersion.set(helmSetting?.main)
    selectedBuilderVersion.set(helmSetting?.builder)
  }

  useEffect(() => {
    if (user?.id?.value != null && helmSettingState?.updateNeeded?.value) {
      HelmSettingService.fetchHelmSetting()
      HelmSettingService.fetchMainHelmVersions()
      HelmSettingService.fetchBuilderHelmVersions()
    }
  }, [user?.id?.value, helmSettingState?.updateNeeded?.value])

  useEffect(() => {
    if (helmSetting?.main) selectedMainVersion.set(helmSetting.main)
    if (helmSetting?.builder) selectedBuilderVersion.set(helmSetting.builder)
  }, [helmSetting])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.helm.header')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputSelect
            name="helmMain"
            label={t('admin:components.setting.helm.main')}
            value={selectedMainVersion.value}
            menu={mainVersionMenu}
            onChange={handleMainVersionChange}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <InputSelect
            name="helmBuilder"
            label={t('admin:components.setting.helm.builder')}
            value={selectedBuilderVersion.value}
            menu={builderVersionMenu}
            onChange={handleBuilderVersionChange}
          />
        </Grid>
      </Grid>

      <Typography component="h1" className={styles.settingsSubheading}>
        {t('admin:components.setting.helm.explainer')}
      </Typography>

      <Button sx={{ maxWidth: '100%' }} className={styles.outlinedButton} onClick={handleCancel}>
        {t('admin:components.common.cancel')}
      </Button>
      <Button sx={{ maxWidth: '100%', ml: 1 }} className={styles.gradientButton} onClick={handleSubmit}>
        {t('admin:components.common.save')}
      </Button>
    </Box>
  )
}

export default Helm
