import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'

import GitHubIcon from '@mui/icons-material/GitHub'
import GroupIcon from '@mui/icons-material/Group'
import { Grid } from '@mui/material'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import { ProjectService } from '../../../common/services/ProjectService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  repos: GithubAppInterface[]
  handleClose: () => void
}

const UploadProjectModal = (props: Props): any => {
  const { open, handleClose, repos } = props
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [createOrPatch, setCreateOrPatch] = useState('patch')
  const [projectURL, setProjectURL] = useState('')
  const [isPublicUrl, setIsPublicUrl] = useState(false)
  const { t } = useTranslation()

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
              [styles.modalContent]: true
            })}
          >
            {!processing && createOrPatch === 'patch' && (
              <FormControl>
                <div className={styles.inputContainer}>
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
                        <em>{t('admin:components.project.selectProject')}</em>
                      </MenuItem>
                      {repos &&
                        repos.map((el: any, i) => (
                          <MenuItem value={`${el.repositoryPath}`} key={i}>
                            {el.name} ({el.user})
                          </MenuItem>
                        ))}
                    </Select>
                  ) : (
                    <Grid container spacing={1} direction="column">
                      <Grid item>
                        <label>{t('admin:components.project.insertPublicUrl')}</label>
                      </Grid>
                      <Grid item>
                        <TextField
                          id="urlSelect"
                          fullWidth
                          value={projectURL}
                          placeholder={'URL'}
                          onChange={(e) => setProjectURL(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  )}
                </div>
                <div className={styles.buttonContainer}>
                  <Button
                    type="submit"
                    startIcon={<GitHubIcon />}
                    variant="contained"
                    color="primary"
                    className={styles.gradientButton}
                    onClick={tryUploadProject}
                  >
                    {t('admin:components.project.uploadProject')}
                  </Button>
                  {repos && repos.length != 0 && (
                    <Button
                      type="submit"
                      startIcon={<GroupIcon />}
                      variant="contained"
                      color="primary"
                      className={styles.gradientButton}
                      onClick={trySelectPublicUrl}
                    >
                      {!isPublicUrl
                        ? t('admin:components.project.customPublicUrl')
                        : t('admin:components.project.selectFromList')}
                    </Button>
                  )}
                </div>
              </FormControl>
            )}
            {processing && (
              <div>
                <CircularProgress color="primary" />
                <div className={styles.accentText}>{t('admin:components.project.processing')}</div>
              </div>
            )}
            {error && error.length > 0 && <h2 className={styles.errorMessage}>{error}</h2>}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default UploadProjectModal
