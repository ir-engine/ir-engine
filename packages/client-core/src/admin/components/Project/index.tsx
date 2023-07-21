/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Chip from '@etherealengine/ui/src/primitives/mui/Chip'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import { ProjectService, ProjectState } from '../../../common/services/ProjectService'
import { AuthState } from '../../../user/services/AuthService'
import styles from '../../styles/admin.module.scss'
import BuildStatusDrawer from './BuildStatusDrawer'
import ProjectDrawer from './ProjectDrawer'
import ProjectTable from './ProjectTable'
import UpdateDrawer from './UpdateDrawer'

const Projects = () => {
  const authState = useHookstate(getMutableState(AuthState))
  const user = authState.user
  const projectState = useHookstate(getMutableState(ProjectState))
  const builderTags = projectState.builderTags.value
  const { t } = useTranslation()
  const githubProvider = user.identityProviders.value?.find((ip) => ip.type === 'github')

  const projectDrawerOpen = useHookstate(false)
  const updateDrawerOpen = useHookstate(false)
  const buildStatusDrawerOpen = useHookstate(false)
  const isFirstRun = useHookstate(true)

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess()
  }

  useEffect(() => {
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

    if (projectState.rebuilding.value) {
      interval = setInterval(ProjectService.checkReloadStatus, 10000)
    } else {
      clearInterval(interval)
      ProjectService.fetchProjects()
    }

    return () => clearInterval(interval)
  }, [projectState.rebuilding.value])

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
            {projectState.rebuilding.value ? (
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
        <Chip label={`Current Engine Version: ${projectState.builderInfo.engineVersion.value}`} />
        <Chip label={`Current Engine Commit: ${projectState.builderInfo.engineCommit.value}`} />
        {githubProvider != null && (
          <Button
            className={styles.refreshGHBtn}
            type="button"
            variant="contained"
            color="primary"
            disabled={projectState.refreshingGithubRepoAccess.value}
            onClick={() => refreshGithubRepoAccess()}
          >
            {projectState.refreshingGithubRepoAccess.value ? (
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
