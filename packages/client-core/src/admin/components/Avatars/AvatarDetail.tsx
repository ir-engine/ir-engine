import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { useStyles } from '../../styles/ui'

const AvatarDetail = ({ avatarData }) => {
  const classes = useStyles()
  return (
    <div>
      <Typography variant="h4" component="h4" className={`${classes.mb20px} ${classes.mt5} ${classes.headingFont}`}>
        Avatar Information
      </Typography>
      <Grid container spacing={3} className={classes.mt5}>
        <Grid item xs={6} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
          <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
            Name:
          </Typography>
          <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
            Description:
          </Typography>
        </Grid>
        <Grid item xs={4} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
          <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
            {avatarData?.name || <span className={classes.spanNone}>None</span>}
          </Typography>
          <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFont}`}>
            {avatarData?.description || <span className={classes.spanNone}>None</span>}
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="h5" component="h5" className={`${classes.mb20px} ${classes.headingFont}`}>
        Avatar
      </Typography>
      <div style={{ width: '500px' }}>
        <img src={avatarData?.url} alt="avatar" />
      </div>
      {/* {avatarData?.url || <span className={classes.spanNone}>None</span>} */}
      <div className={classes.scopeContainer}></div>
    </div>
  )
}

export default AvatarDetail
