import React, { useEffect, useState } from 'react'
import styles from './Header.module.scss'

import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  makeStyles,
  TextField
} from '@material-ui/core'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { Filesystem } from '@capacitor/filesystem'
import { useHistory } from 'react-router'

interface Props {
  title?: string
  creatorState?: any
  addFilesView?: any
  setAddFilesView?: any
  setFilesTarget?: any
  hideAddButtons?: boolean
  inputFileRef?: any
}

const useStyles = makeStyles((theme) => ({
  uploadButton: {
    marginTop: '100px'
  },
  addIcon: {
    fontSize: '100px',
    color: '#CFCFCF'
  }
}))

const AppHeader = ({ title, setAddFilesView, setFilesTarget, hideAddButtons, inputFileRef }: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const classes = useStyles()
  const [userRole, setUserRole] = useState('')
  const history = useHistory()

  useEffect(() => {
    if (authState.user) {
      setUserRole(authState.user?.userRole?.value)
    }
  }, [authState.user])

  const handlePickFiles = async (file) => {
    setFilesTarget([...file.target.files])
    setAddFilesView && setAddFilesView(true)
  }

  const handleTitleClick = () => {
    history.push({
      pathname: '/',
      search: 'tag=all'
    })
  }

  return (
    <nav className={styles.headerContainer}>
      {title && (
        <span onClick={handleTitleClick} className={styles.title}>
          {title}
        </span>
      )}
      <input
        // accept="image/*"
        className={styles.input}
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={handlePickFiles}
        ref={inputFileRef}
      />
      {!hideAddButtons && userRole && userRole != 'guest' ? (
        <div
          style={{ width: 'fit-content', backgroundColor: '#F8F8F8', border: '1px solid #F8F8F8', margin: '0 auto' }}
        >
          <label htmlFor="raised-button-file">
            <Grid container justifyContent="center">
              <AddCircleOutlinedIcon className={classes.addIcon} />
              <br />
            </Grid>
            <Grid container justifyContent="center">
              <Button
                style={{
                  backgroundColor: '#FFF',
                  margin: '10px 20px',
                  border: 'none',
                  boxShadow: 'none',
                  color: '#C4C4C4',
                  fontSize: '15pt',
                  fontWeight: 500
                }}
                variant="contained"
              >
                Add Files
              </Button>
            </Grid>
          </label>
        </div>
      ) : (
        ''
      )}
    </nav>
  )
}

export default AppHeader
