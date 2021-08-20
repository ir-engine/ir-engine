import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
import { Done } from '@material-ui/icons'
import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAdminState } from '../../reducers/admin/selector'
import { selectAppState } from '../../../common/reducers/app/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import styles from './ContentPack.module.scss'
import { downloadContentPack } from '../../reducers/contentPack/service'

interface Props {
  open: boolean
  handleClose: any
  adminState?: any
  uploadAvatar?: any
  downloadContentPack?: any
}

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
    adminState: selectAdminState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  downloadContentPack: bindActionCreators(downloadContentPack, dispatch)
})

const DownloadModal = (props: Props): any => {
  const { open, handleClose, downloadContentPack } = props

  const [contentPackUrl, setContentPackUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const showError = (err: string) => {
    setError(err)
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  const getContentPack = async () => {
    try {
      const res = await downloadContentPack(contentPackUrl)
      showSuccess()
    } catch (err) {
      showError('Invalid URL')
    }
  }

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            <div>Download Content Pack from URL</div>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="contentPackUrl"
              label="Content Pack URL"
              placeholder="https://example.com/content-pack/example/manifest.json"
              name="name"
              required
              value={contentPackUrl}
              onChange={(e) => setContentPackUrl(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" onClick={getContentPack}>
              Download Content Pack
            </Button>
            {error && error.length > 0 && <h2>{error}</h2>}
            {success === true && (
              <div>
                <Done color="primary" />
                <div>Pack download!</div>
              </div>
            )}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DownloadModal)
