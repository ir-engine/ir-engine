import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

import { Box, CircularProgress } from '@mui/material'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'

import { ProjectService, useProjectState } from '../../../common/services/ProjectService'
import { useAuthState } from '../../../user/services/AuthService'
import styles from '../../styles/admin.module.scss'
import BuildStatusDrawer from './BuildStatusDrawer'
import ProjectDrawer from './ProjectDrawer'
import ProjectTable from './ProjectTable'
import UpdateDrawer from './UpdateDrawer'

const Projects = () => {
  const authState = useAuthState()
  const user = authState.user
  const adminProjectState = useProjectState()
  const builderTags = adminProjectState.builderTags.value
  const { t } = useTranslation()
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false)
  const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false)
  const [buildStatusDrawerOpen, setBuildStatusDrawerOpen] = useState(false)
  const [isFirstRun, setIsFirstRun] = useState(true)

  const handleOpenProjectDrawer = () => {
    setProjectDrawerOpen(true)
  }

  const handleOpenUpdateDrawer = () => {
    setUpdateDrawerOpen(true)
  }

  const handleOpenBuildStatusDrawer = () => {
    setBuildStatusDrawerOpen(true)
  }

  const ProjectUpdateSystemInjection = {
    uuid: 'core.admin.ProjectUpdateSystem',
    type: 'PRE_RENDER',
    systemLoader: () => import('../../../systems/ProjectUpdateSystem')
  } as const

  useEffect(() => {
    initSystems(Engine.instance.currentWorld, [ProjectUpdateSystemInjection])
    ProjectService.checkReloadStatus()
  }, [])

  useEffect(() => {
    if (user?.scopes?.value?.find((scope) => scope.type === 'projects:read')) {
      ProjectService.fetchBuilderTags()
      ProjectService.getBuilderInfo()
    }
  }, [user])

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

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={4}>
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
        <Grid item xs={4}>
          <Button
            className={styles.openModalBtn}
            type="button"
            variant="contained"
            color="primary"
            onClick={() => handleOpenUpdateDrawer()}
          >
            {adminProjectState.rebuilding.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
                {isFirstRun ? t('admin:components.project.checking') : t('admin:components.project.rebuilding')}
              </Box>
            ) : (
              t('admin:components.project.updateAndRebuild')
            )}
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            className={styles.openModalBtn}
            type="button"
            variant="contained"
            color="primary"
            onClick={() => handleOpenBuildStatusDrawer()}
          >
            {t('admin:components.project.buildStatus')}
          </Button>
        </Grid>
      </Grid>

      <div className={styles.engineInfo}>
        <Chip label={`Current Engine Version: ${adminProjectState.builderInfo.engineVersion.value}`} />
        <Chip label={`Current Engine Commit: ${adminProjectState.builderInfo.engineCommit.value}`} />
      </div>

      <ProjectTable className={styles.rootTableWithSearch} />

      <UpdateDrawer open={updateDrawerOpen} builderTags={builderTags} onClose={() => setUpdateDrawerOpen(false)} />

      <ProjectDrawer open={projectDrawerOpen} onClose={() => setProjectDrawerOpen(false)} />

      <BuildStatusDrawer open={buildStatusDrawerOpen} onClose={() => setBuildStatusDrawerOpen(false)} />
    </div>
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default Projects
