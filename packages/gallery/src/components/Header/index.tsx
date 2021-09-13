import React, { useEffect } from 'react'
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Button, Grid, makeStyles, Typography } from '@material-ui/core'

interface Props {
  title?: string
}

const useStyles = makeStyles((theme) => ({
  uploadButton: {
    marginTop: '174px'
  }
}))

const AppHeader = ({ title }: Props) => {
  const { t } = useTranslation()
  const classes = useStyles()

  return (
    <nav className={styles.headerContainer}>
      {title && <span>{title}</span>}
      <input
        accept="image/*"
        className={styles.input}
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
      />
      <label htmlFor="raised-button-file">
        <Typography align="center" className={classes.uploadButton}>
          <Button variant="contained" component="span">
            Upload
          </Button>
        </Typography>
      </label>
    </nav>
  )
}

export default AppHeader
