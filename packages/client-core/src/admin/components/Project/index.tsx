import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, CircularProgress } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import { GithubAppService, useAdminGithubAppState } from '../../services/GithubAppService'
import styles from '../../styles/admin.module.scss'
import ProjectDrawer from './ProjectDrawer'
import ProjectTable from './ProjectTable'

const Projects = () => {
  const authState = useAuthState()
  const user = authState.user
  const adminProjectState = useProjectState()
  const githubAppState = useAdminGithubAppState()
  const githubAppRepos = githubAppState.repos.value
  const { t } = useTranslation()
  const [openProjectDrawer, setOpenPartyDrawer] = useState(false)
  const [rebuildModalOpen, setRebuildModalOpen] = useState(false)
  const [isFirstRun, setIsFirstRun] = useState(true)

  const handleOpenProjectDrawer = () => {
    GithubAppService.fetchGithubAppRepos()
    setOpenPartyDrawer(true)
  }

  const handleSubmitRebuild = async () => {
    setRebuildModalOpen(false)

    await ProjectService.triggerReload()

    // This sleep is to ensure previous pod is terminated and new one is started.
    await sleep(60000)

    await ProjectService.checkReloadStatus()
  }

  useEffect(() => {
    ProjectService.checkReloadStatus()
  }, [])

  useEffect(() => {
    let interval

    setIsFirstRun(false)

    if (adminProjectState.rebuilding.value) {
      interval = setInterval(ProjectService.checkReloadStatus, 10000)
    } else {
      clearInterval(interval)
      ProjectService.fetchProjects()
    }

    return () => clearInterval(interval)
  }, [adminProjectState.rebuilding.value])

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
            onClick={handleOpenProjectDrawer}
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
            {adminProjectState.rebuilding.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
                {isFirstRun ? t('admin:components.project.checking') : t('admin:components.project.rebuilding')}
              </Box>
            ) : (
              t('admin:components.project.rebuild')
            )}
          </Button>
        </Grid>
      </Grid>

      <ProjectTable className={styles.rootTableWithSearch} />

      <ConfirmDialog
        open={rebuildModalOpen}
        description={t('admin:components.project.confirmProjectsRebuild')}
        onClose={() => setRebuildModalOpen(false)}
        onSubmit={handleSubmitRebuild}
      />

      <ProjectDrawer open={openProjectDrawer} repos={githubAppRepos} onClose={() => setOpenPartyDrawer(false)} />
    </div>
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default Projects
