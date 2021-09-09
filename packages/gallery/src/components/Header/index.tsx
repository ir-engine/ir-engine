import React, { useEffect, useState } from 'react'
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { useTranslation } from 'react-i18next'
import { Button, Grid, makeStyles, Typography } from '@material-ui/core'
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
    marginTop: '174px'
  },
  addIcon: {
    fontSize: '100px',
    marginLeft: '12px'
  }
}))

const AppHeader = ({ title, createFeed, authState, creatorState }: Props) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const [preview, setPreview] = useState(null)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    if (authState.get('user')) {
      setUserRole(authState.get('user').userRole)
    }
  }, [authState])

  const handlePickFiles = async (file) => setPreview(file.target.files[0])

  const handleAddPost = () => {
    const newPost = {
      title: '',
      description: '',
      preview
    } as any

    createFeed(newPost)
    setPreview(null)
  }

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
        onChange={handlePickFiles}
      />
      {userRole && userRole != 'guest' ? (
        <label htmlFor="raised-button-file">
          <Typography align="center" className={classes.uploadButton}>
            <AddCircleOutlinedIcon className={classes.addIcon} />
            <Button variant="contained" onClick={handleAddPost}>
              Add Files
            </Button>
          </Typography>
        </label>
      ) : (
        ''
      )}
    </nav>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)
