import classNames from 'classnames'
import React, { useState } from 'react'
import styles from './Projects.module.scss'
import { ProjectService } from '../../../common/services/ProjectService'
import { useDispatch } from '../../../store'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Modal from '@mui/material/Modal'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import GroupIcon from '@mui/icons-material/Group'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useAuthState, AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'

interface Props {
  open: boolean
  repos: any
  handleClose: any
  scenes?: any
  avatars?: any
  projects?: any
}

const UploadProjectModal = (props: Props): any => {
  const authState = useAuthState()
  const authType = useAuthState().authUser.identityProvider.type.value

  const { open, handleClose, scenes, repos } = props

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [createOrPatch, setCreateOrPatch] = useState('patch')
  const [projectURL, setProjectURL] = useState('')
  const [isPublicUrl, setIsPublicUrl] = useState(false)
  const dispatch = useDispatch()
  const showError = (err: string) => {
    setError(err)
    setTimeout(() => {
      setError('')
    }, 3000)
  }

  const trySelectPublicUrl = () => {
    setIsPublicUrl(!isPublicUrl)
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
                  {!isPublicUrl && repos && repos.length != 0 ? (
                    <Select
                      labelId="demo-controlled-open-select-label"
                      id="demo-controlled-open-select"
                      value={projectURL}
                      fullWidth
                      displayEmpty
                      onChange={(e) => setProjectURL(e.target.value)}
                      name="projectURL"
                    >
                      <MenuItem value="" disabled>
                        <em>Select Project</em>
                      </MenuItem>
                      {repos &&
                        repos.map((el: any, i) => (
                          <MenuItem value={`${el.repositoryPath.value}`} key={i}>
                            {el.name.value} ({el.user.value})
                          </MenuItem>
                        ))}
                    </Select>
                  ) : (
                    <div>
                      <label>Please insert github public url</label>
                      <TextField
                        className={styles['pack-select']}
                        id="urlSelect"
                        value={projectURL}
                        placeholder={'URL'}
                        onChange={(e) => setProjectURL(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.buttonConatiner}>
                  <Button
                    type="submit"
                    startIcon={<GitHubIcon />}
                    variant="contained"
                    color="primary"
                    onClick={tryUploadProject}
                  >
                    Upload Project
                  </Button>
                  {repos && repos.length != 0 ? (
                    <Button
                      type="submit"
                      startIcon={<GroupIcon />}
                      variant="contained"
                      color="primary"
                      onClick={trySelectPublicUrl}
                    >
                      {!isPublicUrl ? 'Custom Public Url' : 'Select From List'}
                    </Button>
                  ) : (
                    <></>
                  )}
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
