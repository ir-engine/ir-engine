import classNames from 'classnames'
import React, { useState } from 'react'
import styles from './Projects.module.scss'
import { uploadProject } from '../../state/ProjectService'
import { useDispatch } from '../../../store'
import Backdrop from '@material-ui/core/Backdrop'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'

interface Props {
  open: boolean
  handleClose: any
  scenes?: any
  avatars?: any
  projects?: any
}

const AddToContentPackModal = (props: Props): any => {
  const { open, handleClose, scenes } = props

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [createOrPatch, setCreateOrPatch] = useState('patch')
  const [projectURL, setProjectURL] = useState('')
  const [projectName, setProjectName] = useState('')
  const [branchName, seBranchName] = useState('')
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
        await uploadProject(projectURL, branchName, projectName)
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
            {processing === false && createOrPatch === 'patch' && (
              <div>
                <FormControl>
                  <InputLabel id="urlSelect">URL</InputLabel>
                  <TextField
                    className={styles['pack-select']}
                    id="urlSelect"
                    value={projectURL}
                    onChange={(e) => setProjectURL(e.target.value)}
                  />
                  <InputLabel id="branchSelect">Branch</InputLabel>
                  <TextField
                    className={styles['pack-select']}
                    id="branchSelect"
                    value={branchName}
                    onChange={(e) => setProjectURL(e.target.value)}
                  />
                  <InputLabel id="nameSelect">Name</InputLabel>
                  <TextField
                    className={styles['pack-select']}
                    id="nameSelect"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                  <Button type="submit" variant="contained" color="primary" onClick={tryUploadProject}>
                    Upload Project
                  </Button>
                </FormControl>
              </div>
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

export default AddToContentPackModal
