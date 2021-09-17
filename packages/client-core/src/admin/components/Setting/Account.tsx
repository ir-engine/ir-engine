import React from 'react'
import { Grid, Paper, Button, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'

const Account = () => {
  const classes = useStyles()

  const handleSubmit = () => {}
  return (
    <div className={`${classes.root} ${classes.container}`}>
      <Typography component="h1" className={classes.settingsHeading}>
        {' '}
        Login
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <label>Email</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="email" style={{ color: '#fff' }} className={classes.input} placeholder="Email" />
            </Paper>
            <label>Password</label>
            <Paper component="div" className={classes.createInput}>
              <InputBase name="password" style={{ color: '#fff' }} className={classes.input} placeholder="Password" />
            </Paper>
            <Button className={classes.login}>Login</Button>
          </form>
        </Grid>
        <Grid item xs={12} sm={6}>
          social media
        </Grid>
      </Grid>
    </div>
  )
}

export default Account
