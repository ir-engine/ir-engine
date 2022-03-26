import React from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import styles from '../../styles/admin.module.scss'

const AvatarDetail = ({ avatarData }) => {
  return (
    <div>
      <Typography variant="h4" component="h4" className={`${styles.mb20px} ${styles.mt5} ${styles.headingFont}`}>
        Avatar Information
      </Typography>
      <Grid container spacing={3} className={styles.mt5}>
        <Grid item xs={6} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
          <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
            Name:
          </Typography>
          <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
            Description:
          </Typography>
        </Grid>
        <Grid item xs={4} sm={6} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
          <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
            {avatarData?.name || <span className={styles.spanNone}>None</span>}
          </Typography>
          <Typography variant="h6" component="h6" className={`${styles.mb10} ${styles.typoFont}`}>
            {avatarData?.description || <span className={styles.spanNone}>None</span>}
          </Typography>
        </Grid>
      </Grid>
      <Typography variant="h5" component="h5" className={`${styles.mb20px} ${styles.headingFont}`}>
        Avatar
      </Typography>
      <div style={{ width: '500px' }}>
        <img src={avatarData?.url} alt="avatar" />
      </div>
      {/* {avatarData?.url || <span className={styles.spanNone}>None</span>} */}
      <div className={styles.scopeContainer}></div>
    </div>
  )
}

export default AvatarDetail
