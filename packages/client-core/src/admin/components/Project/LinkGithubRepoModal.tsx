import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

import LinkIcon from '@mui/icons-material/Link'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'

import { NotificationService } from '../../../common/services/NotificationService'
import { ProjectService } from '../../../common/services/ProjectService'
import DrawerView from '../../common/DrawerView'
import InputText from '../../common/InputText'
import LoadingView from '../../common/LoadingView'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  project: ProjectInterface
  onClose: () => void
}

const LinkGithubRepoModal = ({ open, project, onClose }: Props) => {
  const [processing, setProcessing] = useState(false)
  const [projectURL, setProjectURL] = useState('')
  const { t } = useTranslation()

  const setProjectRemoteURL = async () => {
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

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.project.linkGithubRepo')}</DialogTitle>

        {!processing && (
          <div className={styles.inputContainer}>
            <InputText
              name="githubUrl"
              label={t('admin:components.project.url')}
              placeholder={t('admin:components.project.linkGithubUrl')}
              value={projectURL}
              onChange={(e) => setProjectURL(e.target.value)}
            />
          </div>
        )}

        {processing && <LoadingView title={t('admin:components.project.processing')} variant="body1" />}

        <DialogActions>
          {!processing && (
            <>
              <Button className={styles.submitButton} startIcon={<LinkIcon />} onClick={setProjectRemoteURL}>
                {t('admin:components.project.linkProject')}
              </Button>
              <Button className={styles.cancelButton} onClick={onClose}>
                {t('admin:components.setting.cancel')}
              </Button>
            </>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default LinkGithubRepoModal
