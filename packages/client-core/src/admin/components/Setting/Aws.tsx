import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Button, Grid, Typography } from '@mui/material'

import { useAuthState } from '../../../user/services/AuthService'
import InputText from '../../common/InputText'
import { AwsSettingService, useAdminAwsSettingState } from '../../services/Setting/AwsSettingService'
import styles from '../../styles/settings.module.scss'

const SMS_PROPERTIES = {
  ACCESS_KEY_ID: 'accessKeyId',
  APPLICATION_ID: 'applicationId',
  REGION: 'region',
  SENDER_ID: 'senderId',
  SECRET_ACCESS_KEY: 'secretAccessKey'
}

const Aws = () => {
  const { t } = useTranslation()
  const awsSettingState = useAdminAwsSettingState()
  const [awsSetting] = awsSettingState?.awsSettings?.value
  const id = awsSetting?.id
  const authState = useAuthState()
  const user = authState.user

  const [sms, setSms] = useState(awsSetting?.sms)

  useEffect(() => {
    if (awsSetting) {
      let tempSms = JSON.parse(JSON.stringify(awsSetting?.sms))
      setSms(tempSms)
    }
  }, [awsSettingState?.updateNeeded?.value])

  const handleSubmit = (event) => {
    event.preventDefault()

    AwsSettingService.patchAwsSetting({ sms: JSON.stringify(sms) }, id)
  }

  const handleCancel = () => {
    let tempSms = JSON.parse(JSON.stringify(awsSetting?.sms))
    setSms(tempSms)
  }

  const handleUpdateSms = (event, type) => {
    setSms({
      ...sms!,
      [type]: event.target.value
    })
  }

  useEffect(() => {
    if (user?.id?.value != null && awsSettingState?.updateNeeded?.value) {
      AwsSettingService.fetchAwsSetting()
    }
  }, [authState?.user?.id?.value, awsSettingState?.updateNeeded?.value])

  return (
    <Box>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.aws')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.keys')}</Typography>

          <InputText
            name="accessKeyId"
            label={t('admin:components.setting.accessKeyId')}
            value={awsSetting?.keys?.accessKeyId || ''}
            disabled
          />

          <InputText
            name="secretAccessKey"
            label={t('admin:components.setting.secretAccessKey')}
            value={awsSetting?.keys?.secretAccessKey || ''}
            disabled
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.s3')}</Typography>

          <InputText
            name="baseUrl"
            label={t('admin:components.setting.baseUrl')}
            value={awsSetting?.s3?.baseUrl || ''}
            disabled
          />

          <InputText
            name="staticResourceBucket"
            label={t('admin:components.setting.staticResourceBucket')}
            value={awsSetting?.s3?.staticResourceBucket || ''}
            disabled
          />

          <InputText
            name="region"
            label={t('admin:components.setting.region')}
            value={awsSetting?.s3?.region || ''}
            disabled
          />

          <InputText
            name="avatarDir"
            label={t('admin:components.setting.avatarDir')}
            value={awsSetting?.s3?.avatarDir || ''}
            disabled
          />

          <InputText
            name="s3DevMode"
            label={t('admin:components.setting.s3DevMode')}
            value={awsSetting?.s3?.s3DevMode || ''}
            disabled
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.route53')}</Typography>

          <InputText
            name="hostedZoneId"
            label={t('admin:components.setting.hostedZoneId')}
            value={awsSetting?.route53?.hostedZoneId || ''}
            disabled
          />

          <InputText
            name="accessKeyId"
            label={t('admin:components.setting.keys')}
            value={awsSetting?.route53?.keys?.accessKeyId || ''}
            disabled
          />

          <InputText
            name="secretAccessKey"
            label={t('admin:components.setting.secretAccessKey')}
            value={awsSetting?.route53?.keys?.secretAccessKey || ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.cloudFront')}</Typography>

          <InputText
            name="domain"
            label={t('admin:components.setting.domain')}
            value={awsSetting?.cloudfront?.domain || ''}
            disabled
          />

          <InputText
            name="distributionId"
            label={t('admin:components.setting.distributionId')}
            value={awsSetting?.cloudfront?.distributionId || ''}
            disabled
          />

          <Typography className={styles.settingsSubHeading}>{t('admin:components.setting.sms')}</Typography>

          <InputText
            name="accessKeyId"
            label={t('admin:components.setting.accessKeyId')}
            value={sms?.accessKeyId || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.ACCESS_KEY_ID)}
          />

          <InputText
            name="applicationId"
            label={t('admin:components.setting.applicationId')}
            value={sms?.applicationId || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.APPLICATION_ID)}
          />

          <InputText
            name="region"
            label={t('admin:components.setting.region')}
            value={sms?.region || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.REGION)}
          />

          <InputText
            name="senderId"
            label={t('admin:components.setting.senderId')}
            value={sms?.senderId || ''}
            onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SENDER_ID)}
          />

          <InputText
            name="secretAccessKey"
            label={t('admin:components.setting.secretAccessKey')}
            value={sms?.secretAccessKey || ''}
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
