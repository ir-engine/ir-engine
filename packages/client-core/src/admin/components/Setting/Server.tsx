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

import { Icon } from '@iconify/react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import InputSwitch from '@etherealengine/client-core/src/common/components/InputSwitch'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { serverSettingPath } from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import styles from '../../styles/settings.module.scss'

const Server = () => {
  const { t } = useTranslation()

  const serverSetting = useFind(serverSettingPath).data.at(0)
  const id = serverSetting?.id

  const gaTrackingId = useHookstate(serverSetting?.gaTrackingId)
  const githubWebhookSecret = useHookstate(serverSetting?.githubWebhookSecret)
  const instanceserverUnreachableTimeoutSeconds = useHookstate(serverSetting?.instanceserverUnreachableTimeoutSeconds)
  const dryRun = useHookstate(true)
  const local = useHookstate(true)

  const patchServerSetting = useMutation(serverSettingPath).patch

  const handleSubmit = (event) => {
    if (!id) return
    patchServerSetting(id, {
      gaTrackingId: gaTrackingId.value,
      githubWebhookSecret: githubWebhookSecret.value,
      instanceserverUnreachableTimeoutSeconds: instanceserverUnreachableTimeoutSeconds.value
    })
  }

  const handleCancel = () => {
    gaTrackingId.set(serverSetting?.gaTrackingId)
    githubWebhookSecret.set(serverSetting?.githubWebhookSecret)
  }

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.server')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <InputText
            name="mode"
            label={t('admin:components.setting.mode')}
            value={serverSetting?.mode || 'test'}
            disabled
          />

          <InputText
            name="hostName"
            label={t('admin:components.setting.hostName')}
            value={serverSetting?.hostname || 'test'}
            disabled
          />

          <InputText
            name="port"
            label={t('admin:components.setting.port')}
            value={serverSetting?.port || ''}
            disabled
          />

          <InputText
            name="clientHost"
            label={t('admin:components.setting.clientHost')}
            value={serverSetting?.clientHost || ''}
            disabled
          />

          <InputText
            name="rootDir"
            label={t('admin:components.setting.rootDirectory')}
            value={serverSetting?.rootDir || ''}
            disabled
          />

          <InputText
            name="publicDir"
            label={t('admin:components.setting.publicDirectory')}
            value={serverSetting?.publicDir || ''}
            disabled
          />

          <InputText
            name="nodeModulesDir"
            label={t('admin:components.setting.nodeModulesDirectory')}
            value={serverSetting?.nodeModulesDir || ''}
            disabled
          />

          <InputText
            name="localStorageProvider"
            label={t('admin:components.setting.localStorageProvider')}
            value={serverSetting?.localStorageProvider || ''}
            disabled
          />

          <InputSwitch
            name="performDryRun"
            label={t('admin:components.setting.performDryRun')}
            checked={dryRun.value}
            disabled
            onChange={(event) => dryRun.set(event.target.checked)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputText
            name="storageProvider"
            label={t('admin:components.setting.storageProvider')}
            value={serverSetting?.storageProvider || ''}
            disabled
          />

          <InputText
            name="gaTrackingId"
            label={t('admin:components.setting.googleAnalyticsTrackingId')}
            value={gaTrackingId.value || ''}
            startAdornment={<Icon style={{ marginRight: 8 }} fontSize={18} icon="emojione:key" />}
            onChange={(e) => gaTrackingId.set(e.target.value)}
          />

          <InputText
            name="hub"
            label={t('admin:components.setting.hub')}
            value={serverSetting?.hub?.endpoint || ''}
            disabled
          />

          <InputText name="url" label={t('admin:components.setting.url')} value={serverSetting?.url || ''} disabled />

          <InputText
            name="certPath"
            label={t('admin:components.setting.certPath')}
            value={serverSetting?.certPath || ''}
            disabled
          />

          <InputText
            name="keyPath"
            label={t('admin:components.setting.keyPath')}
            value={serverSetting?.keyPath || ''}
            disabled
          />

          <InputText
            name="githubWebhookSecret"
            label={t('admin:components.setting.githubWebhookSecret')}
            value={githubWebhookSecret.value || ''}
            onChange={(e) => githubWebhookSecret.set(e.target.value)}
          />

          <InputText
            name="releaseName"
            label={t('admin:components.setting.releaseName')}
            value={serverSetting?.releaseName || ''}
            disabled
          />

          <InputText
            name="releaseName"
            label={t('admin:components.setting.instanceserverUnreachableTimeoutSeconds')}
            value={instanceserverUnreachableTimeoutSeconds?.value || ''}
            onChange={(e) => instanceserverUnreachableTimeoutSeconds.set(e.target.value)}
          />

          <InputSwitch
            name="local"
            label={t('admin:components.setting.local')}
            checked={local.value}
            disabled
            onChange={(event) => local.set(event.target.checked)}
          />
        </Grid>
      </Grid>
      <Button sx={{ maxWidth: '100%' }} className={styles.outlinedButton} onClick={handleCancel}>
        {t('admin:components.common.cancel')}
      </Button>
      <Button sx={{ maxWidth: '100%', ml: 1 }} className={styles.gradientButton} onClick={handleSubmit}>
        {t('admin:components.common.save')}
      </Button>
    </Box>
  )
}

export default Server
