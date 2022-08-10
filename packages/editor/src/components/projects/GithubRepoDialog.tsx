import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { ProjectService } from '@xrengine/client-core/src/common/services/ProjectService'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'

import { Button } from '../inputs/Button'
import styles from './styles.module.scss'

interface Props {
  open: boolean
  project: ProjectInterface
  onClose: any
}

export const GithubRepoDialog = (props: Props): any => {
  const { t } = useTranslation()
  const { open, onClose, project } = props

  const [processing, setProcessing] = useState(false)
  const [projectURL, setProjectURL] = useState('')

  const isCreateMode = !project.repositoryPath

  useEffect(() => {
    if (project.repositoryPath) {
      setProjectURL(project.repositoryPath)
    }
  }, [project])

  const handleSubmit = async () => {
    if (processing) return
    try {
      setProcessing(true)
      if (project.id) await ProjectService.setRepositoryPath(project.id, projectURL)
      setProcessing(false)
      onClose()
    } catch (err) {
      console.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      setProcessing(false)
      throw err
    }
  }

  const handleRemove = async () => {
    if (processing) return
    try {
      setProcessing(true)
      if (project.id) await ProjectService.setRepositoryPath(project.id, '')
      setProcessing(false)
      onClose()
    } catch (err) {
      console.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
      setProcessing(false)
      throw err
    }
  }

  const handleSubmitOnEnter = (event) => {
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }

  const closeDialog = () => {
    setProjectURL('')
    setProcessing(false)
    onClose()
  }

  return (
    <Dialog
      open={open}
      classes={{ paper: styles.githubRepoLinkDialog }}
      onClose={closeDialog}
      closeAfterTransition
      TransitionComponent={Fade}
      TransitionProps={{ in: props.open }}
    >
      <DialogTitle>{isCreateMode ? t('editor.projects.link') : t('editor.projects.unlink')}</DialogTitle>
      <DialogContent>
        <FormControl className={styles.width100}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            size="small"
            placeholder={t('editor.projects.githubURL')}
            InputProps={{
              classes: {
                root: styles.inputContainer,
                notchedOutline: styles.outline,
                input: styles.input
              }
            }}
            value={projectURL}
            onChange={(e) => setProjectURL(e.target.value)}
            onKeyDown={handleSubmitOnEnter}
          />
          {!processing && (
            <div className={styles.deleteButtons}>
              <Button className={styles.outlinedButton} onClick={onClose}>
                {t('admin:components.common.cancel')}
              </Button>
              {!isCreateMode && (
                <Button onClick={handleRemove} className={styles.gradientButton}>
                  {t('editor.projects.unLinkButton')}
                </Button>
              )}
              <Button onClick={handleSubmit} className={styles.gradientButton}>
                {isCreateMode ? t('editor.projects.linkButton') : t('editor.projects.changeLinkButton')}
              </Button>
            </div>
          )}
        </FormControl>
      </DialogContent>
    </Dialog>
  )
}
