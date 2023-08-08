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
import {
  AwsCloudFrontType,
  AwsSmsType,
  awsSettingPath
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import styles from '../../styles/settings.module.scss'

const SMS_PROPERTIES = {
  ACCESS_KEY_ID: 'accessKeyId',
  APPLICATION_ID: 'applicationId',
  REGION: 'region',
  SENDER_ID: 'senderId',
  SECRET_ACCESS_KEY: 'secretAccessKey'
}

const CLOUDFRONT_PROPERTIES = {
  DOMAIN: 'domain',
  DISTRIBUTION_ID: 'distributionId',
  REGION: 'region'
}

const Aws = () => {
  const { t } = useTranslation()

  const patchAwsSettings = useMutation(awsSettingPath).patch
  const adminAwsSettingsData = useFind(awsSettingPath).data.at(0)

  const id = adminAwsSettingsData?.id
  const sms = useHookstate(adminAwsSettingsData?.sms)
  const cloudfront = useHookstate(adminAwsSettingsData?.cloudfront)

  useEffect(() => {
    if (!adminAwsSettingsData) {
      return
    }
    const tempSms = JSON.parse(JSON.stringify(adminAwsSettingsData.sms)) as AwsSmsType
    const tempCloudfront = JSON.parse(JSON.stringify(adminAwsSettingsData.cloudfront)) as AwsCloudFrontType
    sms.set(tempSms)
    cloudfront.set(tempCloudfront)
  }, [adminAwsSettingsData])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!id) return

    patchAwsSettings(id, { sms: sms.value, cloudfront: cloudfront.value })
  }

  const handleCancel = () => {
    const tempSms = JSON.parse(JSON.stringify(adminAwsSettingsData?.sms)) as AwsSmsType
    const tempCloudfront = JSON.parse(JSON.stringify(adminAwsSettingsData?.cloudfront)) as AwsCloudFrontType
    sms.set(tempSms)
    cloudfront.set(tempCloudfront)
  }

  const handleUpdateSms = (event, type) => {
    sms.set({
      ...JSON.parse(JSON.stringify(sms.value)),
      [type]: event.target.value
    })
  }

  const handleUpdateCloudfront = (event, type) => {
    cloudfront.set({
      ...JSON.parse(JSON.stringify(cloudfront.value)),
      [type]: event.target.value
    })
  }

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.aws')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.eks')}</Typography>

          <InputText
            name="accessKeyId"
            label={t('admin:components.setting.accessKeyId')}
            value={adminAwsSettingsData?.eks?.accessKeyId || ''}
            disabled
          />

          <InputText
            name="secretAccessKey"
            label={t('admin:components.setting.secretAccessKey')}
            value={adminAwsSettingsData?.eks?.secretAccessKey || ''}
            disabled
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.s3')}</Typography>

          <InputText
            name="accessKeyId"
            label={t('admin:components.setting.accessKeyId')}
            value={adminAwsSettingsData?.s3?.accessKeyId || ''}
            disabled
          />

          <InputText
            name="secretAccessKey"
            label={t('admin:components.setting.secretAccessKey')}
            value={adminAwsSettingsData?.s3?.secretAccessKey || ''}
            disabled
          />

          <InputText
            name="endpoint"
            label={t('admin:components.setting.endpoint')}
            value={adminAwsSettingsData?.s3?.endpoint || ''}
            disabled
          />

          <InputText
            name="staticResourceBucket"
            label={t('admin:components.setting.staticResourceBucket')}
            value={adminAwsSettingsData?.s3?.staticResourceBucket || ''}
            disabled
          />

          <InputText
            name="region"
            label={t('admin:components.setting.region')}
            value={adminAwsSettingsData?.s3?.region || ''}
            disabled
          />

          <InputText
            name="avatarDir"
            label={t('admin:components.setting.avatarDir')}
            value={adminAwsSettingsData?.s3?.avatarDir || ''}
            disabled
          />

          <InputText
            name="s3DevMode"
            label={t('admin:components.setting.s3DevMode')}
            value={adminAwsSettingsData?.s3?.s3DevMode || ''}
            disabled
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.cloudFront')}</Typography>

          <InputText
            name="domain"
            label={t('admin:components.setting.domain')}
            value={cloudfront?.value?.domain || ''}
            onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.DOMAIN)}
          />

          <InputText
            name="distributionId"
            label={t('admin:components.setting.distributionId')}
            value={cloudfront?.value?.distributionId || ''}
            onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.DISTRIBUTION_ID)}
          />

          <InputText
            name="region"
            label={t('admin:components.setting.region')}
            value={cloudfront?.value?.region || ''}
            onChange={(e) => handleUpdateCloudfront(e, CLOUDFRONT_PROPERTIES.REGION)}
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.sms')}</Typography>

          <InputText
            name="accessKeyId"
            label={t('admin:components.setting.accessKeyId')}
            value={sms?.value?.accessKeyId || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.ACCESS_KEY_ID)}
          />

          <InputText
            name="applicationId"
            label={t('admin:components.setting.applicationId')}
            value={sms?.value?.applicationId || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.APPLICATION_ID)}
          />

          <InputText
            name="region"
            label={t('admin:components.setting.region')}
            value={sms?.value?.region || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.REGION)}
          />

          <InputText
            name="senderId"
            label={t('admin:components.setting.senderId')}
            value={sms?.value?.senderId || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SENDER_ID)}
          />

          <InputText
            name="secretAccessKey"
            label={t('admin:components.setting.secretAccessKey')}
            value={sms?.value?.secretAccessKey || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SECRET_ACCESS_KEY)}
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

export default Aws
