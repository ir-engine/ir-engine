import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import { GithubAppService, useGithubAppState } from '../../services/GithubAppService'
import styles from '../../styles/admin.module.scss'
import ProjectTable from './ProjectTable'
import UploadProjectModal from './UploadProjectModal'

const Projects = () => {
  const authState = useAuthState()
  const user = authState.user
  const adminProjectState = useProjectState()
  const githubAppState = useGithubAppState()
  const githubAppRepos = githubAppState.repos.value
  const { t } = useTranslation()
  const [uploadProjectsModalOpen, setUploadProjectsModalOpen] = useState(false)

  const onOpenUploadModal = () => {
    GithubAppService.fetchGithubAppRepos()
    setUploadProjectsModalOpen(true)
  }

  useEffect(() => {
    if (user?.id.value != null && adminProjectState.updateNeeded.value === true) {
      ProjectService.fetchProjects()
    }
  }, [adminProjectState.updateNeeded.value])

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
            onClick={ProjectService.triggerReload}
          >
            {t('admin:components.project.rebuild')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTable}>
        <ProjectTable />
      </div>
      <UploadProjectModal
        repos={githubAppRepos}
        open={uploadProjectsModalOpen}
        handleClose={() => setUploadProjectsModalOpen(false)}
      />
    </div>
  )
}

export default Projects
