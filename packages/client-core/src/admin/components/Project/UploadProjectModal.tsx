import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'

import GitHubIcon from '@mui/icons-material/GitHub'
import GroupIcon from '@mui/icons-material/Group'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import Modal from '@mui/material/Modal'

import { ProjectService } from '../../../common/services/ProjectService'
import InputSelect, { InputMenuItem } from '../../common/InputSelect'
import InputText from '../../common/InputText'
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

  const projectMenu: InputMenuItem[] = repos.map((el) => {
    return {
      value: el.repositoryPath,
      label: `${el.name} (${el.user})`
    }
  })

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
                    <InputSelect
                      name="projectURL"
                      label={t('admin:components.project.project')}
                      value={projectURL}
                      menu={projectMenu}
                      onChange={(e) => setProjectURL(e.target.value)}
                    />
                  ) : (
                    <InputText
                      name="urlSelect"
                      label={t('admin:components.project.url')}
                      placeholder={t('admin:components.project.insertPublicUrl')}
                      value={projectURL}
                      onChange={(e) => setProjectURL(e.target.value)}
                    />
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
