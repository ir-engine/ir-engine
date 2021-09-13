import React from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'

const Aws = () => {
  const classes = useStyles()

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
                  <InputBase name="accessKeyId" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Secret Access Key:</label>
                  <InputBase name="secretAccessKey" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>Route53</label>
                <Paper component="div" className={classes.createInput}>
                  <label> Hosted Zone ID:</label>
                  <InputBase name="hostedZoneId" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>

                <Paper className={classes.Paper} elevation={0}>
                  <label style={{ color: '#fff' }}>KEYS</label>
                  <Paper component="div" className={classes.createInput}>
                    <label>Access Key ID:</label>
                    <InputBase name="accessKeyId" className={classes.input} disabled style={{ color: '#fff' }} />
                  </Paper>
                  <Paper component="div" className={classes.createInput}>
                    <label>Secret Access Key:</label>
                    <InputBase name="secretAccessKey" className={classes.input} disabled style={{ color: '#fff' }} />
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
                    value="https://s3.amazonaws.com"
                    className={classes.input}
                    style={{ color: '#fff' }}
                  />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Static Resource Bucket:</label>
                  <InputBase name="staticResourceBucket" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>Region:</label>
                  <InputBase name="region" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>AvatarDir:</label>
                  <InputBase name="avatarDir" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label>S3DevMode:</label>
                  <InputBase name="s3DevMode" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>Cloud Front</label>
                <Paper component="div" className={classes.createInput}>
                  <label> Domain:</label>
                  <InputBase name="domain" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Distribution ID:</label>
                  <InputBase name="distributionId" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.Paper} elevation={0}>
                <label style={{ color: '#fff' }}>SMS</label>
                <Paper component="div" className={classes.createInput}>
                  <label> Access Key ID:</label>
                  <InputBase name="accessKeyId" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Application ID :</label>
                  <InputBase name="applicationId" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Region:</label>
                  <InputBase name="region" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Sender ID:</label>
                  <InputBase name="senderId" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
                <Paper component="div" className={classes.createInput}>
                  <label> Secret Access Key:</label>
                  <InputBase name="secretAccessKey" className={classes.input} disabled style={{ color: '#fff' }} />
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </form>
    </div>
  )
}

export default Aws
