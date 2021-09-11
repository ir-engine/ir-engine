import React from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'
import { Divider } from '@material-ui/core'

const Account = () => {
  const classes = useStyles()

  const handleSubmit = (event) => {
    event.preventDefault()
  }
  return (
    <div className={`${classes.root} ${classes.container}`}>
      <Typography component="h1" className={classes.settingsHeading}>
        {' '}
        AUTHENTICATION
      </Typography>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4}>
            <label> Service</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="service" style={{ color: '#fff' }} disabled className={classes.input} />
            </Paper>
            <label>Secret</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="secret" style={{ color: '#fff' }} disabled className={classes.input} />
            </Paper>
            <label>Entity</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="entity" style={{ color: '#fff' }} disabled className={classes.input} />
            </Paper>
            <Typography component="h1" className={classes.settingsHeading}>
              Authentication Strategies
            </Typography>
            <label>Local</label>
            <Paper component="div" className={classes.createInput}>
              <label>User Name:</label>
              <InputBase name="username" style={{ color: '#fff' }} disabled className={classes.input} />
            </Paper>
            <Paper component="div" className={classes.createInput}>
              <label>Password:</label>
              <InputBase name="password" style={{ color: '#fff' }} disabled className={classes.input} />
            </Paper>
            <label>Facebook</label>
            <Paper component="div" className={classes.createInput}>
              <label>url:</label>
              <InputBase name="facebbok" style={{ color: '#fff' }} className={classes.input} />
            </Paper>
            <label>Github</label>
            <Paper component="div" className={classes.createInput}>
              <label>URL:</label>
              <InputBase name="github" style={{ color: '#fff' }} className={classes.input} />
            </Paper>
          </Grid>

          <Grid item xs={6} sm={4}>
            <label>Google</label>
            <Paper component="div" className={classes.createInput}>
              <label>URL:</label>
              <InputBase name="Google" style={{ color: '#fff' }} className={classes.input} />
            </Paper>
            <label>LinkedIn</label>
            <Paper component="div" className={classes.createInput}>
              <label>url:</label>
              <InputBase name="linkedin" style={{ color: '#fff' }} className={classes.input} />
            </Paper>
            <label>Twitter</label>
            <Paper component="div" className={classes.createInput}>
              <label>url:</label>
              <InputBase name="twitter" style={{ color: '#fff' }} className={classes.input} />
            </Paper>

            <Typography component="h1" className={classes.settingsHeading}>
              OAUTH
            </Typography>
            <label>Defaults</label>
            <Paper component="div" className={classes.createInput}>
              <label>Host:</label>
              <InputBase name="host" style={{ color: '#fff' }} disabled className={classes.input} />
            </Paper>
            <Paper component="div" className={classes.createInput}>
              <label>Protocol:</label>
              <InputBase name="protocol" style={{ color: '#fff' }} disabled value="https" className={classes.input} />
            </Paper>
            <Paper className={classes.Paper} elevation={0}>
              <label style={{ color: '#fff' }}>Facebook</label>
              <Paper component="div" className={classes.createInput}>
                <label>Key:</label>
                <InputBase name="key" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label>Secret:</label>
                <InputBase name="secret" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Paper className={classes.Paper} style={{ marginBottom: '10px' }} elevation={0}>
              <label style={{ color: '#fff' }}>Github</label>
              <Paper component="div" className={classes.createInput}>
                <label>Key:</label>
                <InputBase name="key" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label>Secret:</label>
                <InputBase name="secret" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
            </Paper>

            <Paper className={classes.Paper} style={{ marginBottom: '10px' }} elevation={0}>
              <label style={{ color: '#fff' }}>Google</label>
              <Paper component="div" className={classes.createInput}>
                <label>Key:</label>
                <InputBase name="key" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label>Secret:</label>
                <InputBase name="secret" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
            </Paper>

            <Paper className={classes.Paper} style={{ marginBottom: '10px' }} elevation={0}>
              <label style={{ color: '#fff' }}>LinkedIn</label>
              <Paper component="div" className={classes.createInput}>
                <label>Key:</label>
                <InputBase name="key" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label>Secret:</label>
                <InputBase name="secret" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
            </Paper>

            <Paper className={classes.Paper} elevation={0}>
              <label style={{ color: '#ffff' }}>Twitter</label>
              <Paper component="div" className={classes.createInput}>
                <label>Key:</label>
                <InputBase name="key" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
              <Paper component="div" className={classes.createInput}>
                <label>Secret:</label>
                <InputBase name="secret" style={{ color: '#fff' }} disabled className={classes.input} />
              </Paper>
            </Paper>
          </Grid>
        </Grid>
        <Button variant="outlined" style={{ color: '#fff' }}>
          Cancel
        </Button>
        &nbsp; &nbsp;
        <Button variant="contained" type="submit">
          Save
        </Button>
      </form>
    </div>
  )
}

export default Account
