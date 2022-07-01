import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
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

const GithubRepoDrawer = ({ open, project, onClose }: Props) => {
  const { t } = useTranslation()
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

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>
          {t(
            isCreateMode
              ? 'admin:components.project.setGithubRepoLink'
              : 'admin:components.project.updateGithubRepoLink'
          )}
        </DialogTitle>

        {!processing && (
          <InputText
            name="githubUrl"
            label={t('admin:components.project.githubRepoUrl')}
            value={projectURL}
            onChange={(e) => setProjectURL(e.target.value)}
          />
        )}

        {processing && <LoadingView title={t('admin:components.project.processing')} variant="body1" />}

        <DialogActions>
          {!processing && (
            <>
              <Button className={styles.outlinedButton} onClick={onClose}>
                {t('admin:components.common.cancel')}
              </Button>

              {!isCreateMode && (
                <Button className={styles.gradientButton} startIcon={<LinkOffIcon />} onClick={handleRemove}>
                  {t('admin:components.project.remove')}
                </Button>
              )}
              <Button
                className={styles.gradientButton}
                startIcon={isCreateMode ? undefined : <LinkIcon />}
                onClick={handleSubmit}
              >
                {t('admin:components.common.submit')}
              </Button>
            </>
          )}
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default GithubRepoDrawer
