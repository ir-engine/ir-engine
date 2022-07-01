import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import { GithubAppService, useAdminGithubAppState } from '../../services/GithubAppService'
import styles from '../../styles/admin.module.scss'
import AddProject from './AddProject'
import ProjectTable from './ProjectTable'

const Projects = () => {
  const authState = useAuthState()
  const user = authState.user
  const adminProjectState = useProjectState()
  const githubAppState = useAdminGithubAppState()
  const githubAppRepos = githubAppState.repos.value
  const { t } = useTranslation()
  const [uploadProjectsModalOpen, setUploadProjectsModalOpen] = useState(false)
  const [rebuildModalOpen, setRebuildModalOpen] = useState(false)

  const onOpenUploadModal = () => {
    GithubAppService.fetchGithubAppRepos()
    setUploadProjectsModalOpen(true)
  }

  const onSubmitRebuild = () => {
    setRebuildModalOpen(false)
    ProjectService.triggerReload()
  }

  useEffect(() => {
    if (user?.id.value != null && adminProjectState.updateNeeded.value === true) {
      ProjectService.fetchProjects()
    }
  }, [user?.id.value, adminProjectState.updateNeeded.value])

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={6}>
          <Button
            className={styles.openModalBtn}
            type="button"
            variant="contained"
            color="primary"
            onClick={onOpenUploadModal}
          >
            {t('admin:components.project.addProject')}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            className={styles.openModalBtn}
            type="button"
            variant="contained"
            color="primary"
            onClick={() => setRebuildModalOpen(true)}
          >
            {t('admin:components.project.rebuild')}
          </Button>
        </Grid>
      </Grid>

      <ProjectTable className={styles.rootTable} />

      <ConfirmModal
        open={rebuildModalOpen}
        description={t('admin:components.project.confirmProjectsRebuild')}
        onClose={() => setRebuildModalOpen(false)}
        onSubmit={onSubmitRebuild}
      />

      <AddProject
        open={uploadProjectsModalOpen}
        repos={githubAppRepos}
        onClose={() => setUploadProjectsModalOpen(false)}
      />
    </div>
  )
}

export default Projects
