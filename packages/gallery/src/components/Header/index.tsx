import React, { useEffect, useState } from 'react'
import styles from './Header.module.scss'

import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  makeStyles,
  TextField,
  Typography
} from '@material-ui/core'
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined'
import { createFeed } from '../../reducers/post/service'
import { selectCreatorsState } from '../../../../social/src/reducers/creator/selector'

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createFeed: bindActionCreators(createFeed, dispatch)
})
interface Props {
  title?: string
  createFeed?: typeof createFeed
  authState?: any
  creatorState?: any
}

const useStyles = makeStyles((theme) => ({
  uploadButton: {
    marginTop: '100px'
  },
  addIcon: {
    fontSize: '100px'
  }
}))

const AppHeader = ({ title, createFeed, authState, creatorState }: Props) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [preview, setPreview] = useState(null)
  const [titleFile, setTitleFile] = useState('')
  const [userRole, setUserRole] = useState('')
  const [open, setOpen] = useState(false)
  const [descrText, setDescrText] = useState('')

  useEffect(() => {
    if (authState.get('user')) {
      setUserRole(authState.get('user').userRole)
    }
  }, [authState])

  const handlePickFiles = async (file) => {
    setPreview(file.target.files[0])
    setTitleFile(file.target.files[0].name)
    setOpen(true)
  }

  const handleDescrTextChange = (event: any): void => setDescrText(event.target.value)

  const handleCloseDescr = () => {
    setOpen(false)
  }

  const handleAddPost = () => {
    const newPost = {
      title: titleFile,
      description: descrText,
      preview
    } as any

    createFeed(newPost)
    setPreview(null)
    setDescrText('')
    setTitleFile('')
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
            <Button variant="contained" onClick={handleAddPost}>
              Add Files
            </Button>
          </Grid>
        </label>
      ) : (
        ''
      )}
      <div>
        <Dialog open={open} onClose={handleCloseDescr} aria-labelledby="form-dialog-title">
          <DialogContent>
            <DialogContentText>Description</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Add description"
              fullWidth
              value={descrText}
              onChange={handleDescrTextChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDescr} color="primary">
              Cancel
            </Button>
            <Button onClick={handleCloseDescr} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </nav>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)
