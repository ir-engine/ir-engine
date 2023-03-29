import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { initSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Button from '@etherealengine/ui/src/Button'
import Chip from '@etherealengine/ui/src/Chip'
import CircularProgress from '@etherealengine/ui/src/CircularProgress'
import Grid from '@etherealengine/ui/src/Grid'

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
  const githubProvider = user.identityProviders.value?.find((ip) => ip.type === 'github')

  const projectDrawerOpen = useHookstate(false)
  const updateDrawerOpen = useHookstate(false)
  const buildStatusDrawerOpen = useHookstate(false)
  const isFirstRun = useHookstate(true)

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess()
  }

  const ProjectUpdateSystemInjection = {
    uuid: 'core.admin.ProjectUpdateSystem',
    type: 'PRE_RENDER',
    systemLoader: () => import('../../../systems/ProjectUpdateSystem')
  } as const

  useEffect(() => {
    initSystems([ProjectUpdateSystemInjection])
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

    isFirstRun.set(false)

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
            onClick={() => projectDrawerOpen.set(true)}
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
            onClick={() => updateDrawerOpen.set(true)}
          >
            {adminProjectState.rebuilding.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
                {isFirstRun.value ? t('admin:components.project.checking') : t('admin:components.project.rebuilding')}
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
            onClick={() => buildStatusDrawerOpen.set(true)}
          >
            {t('admin:components.project.buildStatus')}
          </Button>
        </Grid>
      </Grid>

      <div className={styles.engineInfo}>
        <Chip label={`Current Engine Version: ${adminProjectState.builderInfo.engineVersion.value}`} />
        <Chip label={`Current Engine Commit: ${adminProjectState.builderInfo.engineCommit.value}`} />
        {githubProvider != null && (
          <Button
            className={styles.refreshGHBtn}
            type="button"
            variant="contained"
            color="primary"
            disabled={adminProjectState.refreshingGithubRepoAccess.value}
            onClick={() => refreshGithubRepoAccess()}
          >
            {adminProjectState.refreshingGithubRepoAccess.value ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress color="inherit" size={24} sx={{ marginRight: 1 }} />
                {t('admin:components.project.refreshingGithubRepoAccess')}
              </Box>
            ) : (
              t('admin:components.project.refreshGithubRepoAccess')
            )}
          </Button>
        )}
      </div>

      <ProjectTable className={styles.rootTableWithSearch} />

      <UpdateDrawer
        open={updateDrawerOpen.value}
        builderTags={builderTags}
        onClose={() => updateDrawerOpen.set(false)}
      />

      <ProjectDrawer open={projectDrawerOpen.value} onClose={() => projectDrawerOpen.set(false)} />

      <BuildStatusDrawer open={buildStatusDrawerOpen.value} onClose={() => buildStatusDrawerOpen.set(false)} />
    </div>
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default Projects
