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
import { createFeed } from '../../reducers/post/service'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createFeed: bindActionCreators(createFeed, dispatch)
})
interface Props {
  title?: string
  createFeed?: typeof createFeed
  creatorState?: any
  addFilesView?: any
  setAddFilesView?: any
  setFilesTarget?: any
}

const useStyles = makeStyles((theme) => ({
  uploadButton: {
    marginTop: '100px'
  },
  addIcon: {
    fontSize: '100px'
  }
}))

const AppHeader = ({ title, setAddFilesView, setFilesTarget }: Props) => {
  const { t } = useTranslation()
  const authState = useAuthState()
  const classes = useStyles()
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    if (authState.user) {
      setUserRole(authState.user?.userRole?.value)
    }
  }, [authState])

  const handlePickFiles = async (file) => {
    setFilesTarget(file.target.files)
    setAddFilesView(true)
  }

  return (
    <nav className={styles.headerContainer}>
      {title && <span>{title}</span>}
      <input
        // accept="image/*"
        className={styles.input}
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={handlePickFiles}
      />
      {userRole && userRole != 'guest' ? (
        <label htmlFor="raised-button-file">
          <Grid container justifyContent="center">
            <AddCircleOutlinedIcon className={classes.addIcon} />
            <br />
          </Grid>
          <Grid container justifyContent="center">
            <Button variant="contained">Add Files</Button>
          </Grid>
        </label>
      ) : (
        ''
      )}
    </nav>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)
