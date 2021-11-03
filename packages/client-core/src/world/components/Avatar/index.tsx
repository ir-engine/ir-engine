import React, { Fragment } from 'react'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import styles from './Avatar.module.scss'

const LetterAvatars = (): any => {
  return (
    <Fragment>
      <Typography variant="body1" color="inherit">
        Adam
      </Typography>
      <div className="root">
        <Avatar className={styles.purple}>S</Avatar>
      </div>
    </Fragment>
  )
}

export default LetterAvatars
