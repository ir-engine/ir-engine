import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Grid, Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'

import { useAuthState } from '../../../user/services/AuthService'
import { AwsSettingService, useAdminAwsSettingState } from '../../services/Setting/AwsSettingService'
import styles from '../../styles/settings.module.scss'

interface Props {}

const SMS_PROPERTIES = {
  ACCESS_KEY_ID: 'accessKeyId',
  APPLICATION_ID: 'applicationId',
  REGION: 'region',
  SENDER_ID: 'senderId',
  SECRET_ACCESS_KEY: 'secretAccessKey'
}

const Aws = (props: Props) => {
  const awsSettingState = useAdminAwsSettingState()
  const [awsSetting] = awsSettingState?.awsSettings?.value
  const id = awsSetting?.id
  const authState = useAuthState()
  const user = authState.user
  const { t } = useTranslation()

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
    <div>
      <Typography component="h1" className={styles.settingsHeading}>
        {t('admin:components.setting.aws')}
      </Typography>
      <form>
        <div className={styles.root}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.keys')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.accessKeyId')}:</label>
                  <InputBase
                    name="accessKeyId"
                    value={awsSetting?.keys?.accessKeyId || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.secretAccessKey')}:</label>
                  <InputBase
                    name="secretAccessKey"
                    value={awsSetting?.keys?.secretAccessKey || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.route53')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.hostedZoneId')}:</label>
                  <InputBase
                    name="hostedZoneId"
                    value={awsSetting?.route53?.hostedZoneId || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>

                <Paper className={styles.Paper} elevation={0}>
                  <label>{t('admin:components.setting.keys')}</label>
                  <Paper component="div" className={styles.createInput}>
                    <label>{t('admin:components.setting.accessKeyId')}:</label>
                    <InputBase
                      name="accessKeyId"
                      value={awsSetting?.route53?.keys?.accessKeyId || ''}
                      className={styles.input}
                      disabled
                    />
                  </Paper>
                  <Paper component="div" className={styles.createInput}>
                    <label>{t('admin:components.setting.secretAccessKey')}:</label>
                    <InputBase
                      name="secretAccessKey"
                      value={awsSetting?.route53?.keys?.secretAccessKey || ''}
                      className={styles.input}
                      disabled
                    />
                  </Paper>
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.s3')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.baseUrl')}:</label>
                  <InputBase disabled name="baseUrl" value={awsSetting?.s3?.baseUrl || ''} className={styles.input} />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.staticResourceBucket')}:</label>
                  <InputBase
                    name="staticResourceBucket"
                    value={awsSetting?.s3?.staticResourceBucket || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.region')}:</label>
                  <InputBase name="region" value={awsSetting?.s3?.region || ''} className={styles.input} disabled />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.avatarDir')}:</label>
                  <InputBase
                    name="avatarDir"
                    value={awsSetting?.s3?.avatarDir || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label>{t('admin:components.setting.s3DevMode')}:</label>
                  <InputBase
                    name="s3DevMode"
                    value={awsSetting?.s3?.s3DevMode || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.cloudFront')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.domain')}:</label>
                  <InputBase
                    name="domain"
                    value={awsSetting?.cloudfront?.domain || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.distributionId')}:</label>
                  <InputBase
                    name="distributionId"
                    value={awsSetting?.cloudfront?.distributionId || ''}
                    className={styles.input}
                    disabled
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={styles.Paper} elevation={0}>
                <label>{t('admin:components.setting.sms')}</label>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.accessKeyId')}:</label>
                  <InputBase
                    value={sms?.accessKeyId || ''}
                    name="accessKeyId"
                    className={styles.input}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.ACCESS_KEY_ID)}
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.applicationId')} :</label>
                  <InputBase
                    name="applicationId"
                    value={sms?.applicationId || ''}
                    className={styles.input}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.APPLICATION_ID)}
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.region')}:</label>
                  <InputBase
                    name="region"
                    value={sms?.region || ''}
                    className={styles.input}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.REGION)}
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.senderId')}:</label>
                  <InputBase
                    name="senderId"
                    value={sms?.senderId || ''}
                    className={styles.input}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SENDER_ID)}
                  />
                </Paper>
                <Paper component="div" className={styles.createInput}>
                  <label> {t('admin:components.setting.secretAccessKey')}:</label>
                  <InputBase
                    name="secretAccessKey"
                    value={sms?.secretAccessKey || ''}
                    className={styles.input}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SECRET_ACCESS_KEY)}
                  />
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Button sx={{ maxWidth: '100%' }} variant="outlined" className={styles.cancelButton} onClick={handleCancel}>
          {t('admin:components.setting.cancel')}
        </Button>
        &nbsp;&nbsp;
        <Button
          sx={{ maxWidth: '100%' }}
          variant="contained"
          className={styles.saveBtn}
          type="submit"
          onClick={handleSubmit}
        >
          {t('admin:components.setting.save')}
        </Button>
      </form>
    </div>
  )
}

export default Aws
