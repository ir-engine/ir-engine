import React, { useState, useEffect } from 'react'
import { Grid, Paper, Button, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import { useAdminAwsSettingState } from '../../services/Setting/AwsSettingService'
import { AwsSettingService } from '../../services/Setting/AwsSettingService'
import { useStyles } from './styles'
import { useAuthState } from '../../../user/services/AuthService'

interface Props {}

const SMS_PROPERTIES = {
  ACCESS_KEY_ID: 'accessKeyId',
  APPLICATION_ID: 'applicationId',
  REGION: 'region',
  SENDER_ID: 'senderId',
  SECRET_ACCESS_KEY: 'secretAccessKey'
}

const Aws = (props: Props) => {
  const classes = useStyles()
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

    AwsSettingService.pathAwsSetting({ sms: JSON.stringify(sms) }, id)
  }

  const handleCancel = () => {
    let tempSms = JSON.parse(JSON.stringify(awsSetting?.sms))
    setSms(tempSms)
  }

  const handleUpdateSms = (event, type) => {
    setSms({
      ...sms,
      [type]: event.target.value
    })
  }

  useEffect(() => {
    if (user?.id?.value != null && awsSettingState?.updateNeeded?.value) {
      AwsSettingService.fetchAwsSetting()
    }
  }, [authState])

  return (
    <div>
      <Typography component="h1" className={classes.settingsHeading}>
        AWS
      </Typography>
      <form>
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>Keys</label>
                <Paper component="div" className={classes.createInput}>
                  <label>Access Key ID:</label>
                  <InputBase
                    name="accessKeyId"
                    value={awsSetting?.keys?.accessKeyId || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret Access Key:</label>
                  <InputBase
                    name="secretAccessKey"
                    value={awsSetting?.keys?.secretAccessKey || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>Route53</label>
                <Paper component="div" className={classes.createInput}>
                  <label> Hosted Zone ID:</label>
                  <InputBase
                    name="hostedZoneId"
                    value={awsSetting?.route53?.hostedZoneId || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>

                <Paper className={classes.Paper} elevation={0}>
                  <label style={{ color: '#fff' }}>KEYS</label>
                  <Paper component="div" className={classes.createInput}>
                    <label>Access Key ID:</label>
                    <InputBase
                      name="accessKeyId"
                      value={awsSetting?.route53?.keys?.accessKeyId || ''}
                      className={classes.input}
                      disabled
                      style={{ color: '#fff' }}
                    />
                  </Paper>
                  <Paper component="div" className={classes.createInput}>
                    <label>Secret Access Key:</label>
                    <InputBase
                      name="secretAccessKey"
                      value={awsSetting?.route53?.keys?.secretAccessKey || ''}
                      className={classes.input}
                      disabled
                      style={{ color: '#fff' }}
                    />
                  </Paper>
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>S3</label>
                <Paper component="div" className={classes.createInput}>
                  <label>BaseUrl:</label>
                  <InputBase
                    disabled
                    name="baseUrl"
                    value={awsSetting?.s3?.baseUrl || ''}
                    className={classes.input}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Static Resource Bucket:</label>
                  <InputBase
                    name="staticResourceBucket"
                    value={awsSetting?.s3?.staticResourceBucket || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Region:</label>
                  <InputBase
                    name="region"
                    value={awsSetting?.s3?.region || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>AvatarDir:</label>
                  <InputBase
                    name="avatarDir"
                    value={awsSetting?.s3?.avatarDir || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>S3DevMode:</label>
                  <InputBase
                    name="s3DevMode"
                    value={awsSetting?.s3?.s3DevMode || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>Cloud Front</label>
                <Paper component="div" className={classes.createInput}>
                  <label> Domain:</label>
                  <InputBase
                    name="domain"
                    value={awsSetting?.cloudfront?.domain || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Distribution ID:</label>
                  <InputBase
                    name="distributionId"
                    value={awsSetting?.cloudfront?.distributionId || ''}
                    className={classes.input}
                    disabled
                    style={{ color: '#fff' }}
                  />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>SMS</label>
                <Paper component="div" className={classes.createInput}>
                  <label> Access Key ID:</label>
                  <InputBase
                    value={sms?.accessKeyId || ''}
                    name="accessKeyId"
                    className={classes.input}
                    style={{ color: '#fff' }}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.ACCESS_KEY_ID)}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Application ID :</label>
                  <InputBase
                    name="applicationId"
                    value={sms?.applicationId || ''}
                    className={classes.input}
                    style={{ color: '#fff' }}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.APPLICATION_ID)}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Region:</label>
                  <InputBase
                    name="region"
                    value={sms?.region || ''}
                    className={classes.input}
                    style={{ color: '#fff' }}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.REGION)}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Sender ID:</label>
                  <InputBase
                    name="senderId"
                    value={sms?.senderId || ''}
                    className={classes.input}
                    style={{ color: '#fff' }}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SENDER_ID)}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Secret Access Key:</label>
                  <InputBase
                    name="secretAccessKey"
                    value={sms?.secretAccessKey || ''}
                    className={classes.input}
                    style={{ color: '#fff' }}
                    onChange={(e) => handleUpdateSms(e, SMS_PROPERTIES.SECRET_ACCESS_KEY)}
                  />
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Button variant="outlined" style={{ color: '#fff' }} onClick={handleCancel}>
          Cancel
        </Button>
        &nbsp;&nbsp;
        <Button variant="contained" type="submit" onClick={handleSubmit}>
          Save
        </Button>
      </form>
    </div>
  )
}

export default Aws
