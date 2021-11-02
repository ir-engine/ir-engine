import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import { Done } from '@mui/icons-material'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useDispatch } from '../../../store'
import styles from './ContentPack.module.scss'
import { ContentPackService } from '../../services/ContentPackService'

interface Props {
  open: boolean
  handleClose: any
  uploadAvatar?: any
}

const DownloadModal = (props: Props): any => {
  const { open, handleClose } = props

  const [contentPackUrl, setContentPackUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const dispatch = useDispatch()

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
      const res = await ContentPackService.downloadContentPack(contentPackUrl)
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

export default DownloadModal
