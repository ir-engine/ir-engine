import classNames from 'classnames'
import React, { useState } from 'react'
import styles from '@xrengine/client-core/src/admin/components/Project/Projects.module.scss'
import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { ProjectService } from '@xrengine/client-core/src/admin/state/ProjectService'

interface Props {
  open: boolean
  handleClose: any
  scenes?: any
  avatars?: any
  projects?: any
}

export const CreateProjectModal = (props: Props): any => {
  const { open, handleClose, scenes } = props

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [projectName, setProjectName] = useState('')

  const showError = (err: string) => {
    setError(err)
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  const createProject = async () => {
    try {
      if (projectName !== '') {
        setProcessing(true)
        await ProjectService.createProject(projectName)
        setProcessing(false)
        closeModal()
      }
    } catch (err) {
      setProcessing(false)
      showError(err.message)
    }
  }

  const closeModal = () => {
    setProjectName('')
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
            {processing === false && (
              <div>
                <FormControl>
                  <div>
                    <InputLabel id="nameSelect">Name</InputLabel>
                    <TextField
                      className={styles['pack-select']}
                      id="nameSelect"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="contained" color="primary" onClick={createProject}>
                    Create Project
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
