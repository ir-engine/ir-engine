import classNames from 'classnames'
import React, { useState } from 'react'
import styles from './Projects.module.scss'
import { ProjectService } from '../../services/ProjectService'
import { useDispatch } from '../../../store'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

interface Props {
  open: boolean
  handleClose: any
  scenes?: any
  avatars?: any
  projects?: any
}

const UploadProjectModal = (props: Props): any => {
  const { open, handleClose, scenes } = props

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [createOrPatch, setCreateOrPatch] = useState('patch')
  const [projectURL, setProjectURL] = useState('')
  const dispatch = useDispatch()
  const showError = (err: string) => {
    setError(err)
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  const tryUploadProject = async () => {
    try {
      if (projectURL !== '') {
        setProcessing(true)
        await ProjectService.uploadProject(projectURL)
        setProcessing(false)
        closeModal()
      }
    } catch (err) {
      setProcessing(false)
      showError(err.message)
    }
  }

  const closeModal = () => {
    setProjectURL('')
    handleClose()
  }

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={closeModal}
        closeAfterTransition
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            {processing === false && createOrPatch === 'patch' && (
              <FormControl>
                <div className={styles.inputConatiner}>
                  <TextField
                    className={styles['pack-select']}
                    id="urlSelect"
                    value={projectURL}
                    placeholder={'URL'}
                    onChange={(e) => setProjectURL(e.target.value)}
                  />
                </div>
                <div className={styles.buttonConatiner}>
                  <Button type="submit" variant="contained" color="primary" onClick={tryUploadProject}>
                    Upload Project
                  </Button>
                </div>
              </FormControl>
            )}
            {processing === true && (
              <div className={styles.processing}>
                <CircularProgress color="primary" />
                <div className={styles.text}>Processing</div>
              </div>
            )}
            {error && error.length > 0 && <h2 className={styles['error-message']}>{error}</h2>}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default UploadProjectModal
