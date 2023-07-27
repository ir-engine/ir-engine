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

import ProjectDrawer from '@etherealengine/client-core/src/admin/components/Project/ProjectDrawer'
import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { ProjectInterface } from '@etherealengine/common/src/interfaces/ProjectInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import {
  ArrowRightRounded,
  Check,
  Clear,
  Delete,
  Download,
  DownloadDone,
  FilterList,
  Group,
  Link,
  LinkOff,
  Search,
  Settings,
  Upload
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Button as MuiButton,
  Paper
} from '@mui/material'

import { getProjects } from '../../functions/projectFunctions'
import { EditorAction } from '../../services/EditorServices'
import { Button, MediumButton } from '../inputs/Button'
import { CreateProjectDialog } from './CreateProjectDialog'
import { DeleteDialog } from './DeleteDialog'
import { EditPermissionsDialog } from './EditPermissionsDialog'
import styles from './styles.module.scss'

const logger = multiLogger.child({ component: 'editor:ProjectsPage' })

function sortAlphabetical(a, b) {
  if (a > b) return -1
  if (b > a) return 1
  return 0
}

const OfficialProjectData = [
  {
    id: '1570ae14-889a-11ec-886e-b126f7590685',
    name: 'ee-ethereal-village',
    repositoryPath: 'https://github.com/etherealengine/ee-ethereal-village',
    thumbnail: 'https://media.githubusercontent.com/media/EtherealEngine/ee-ethereal-village/dev/thumbnail.png',
    description: 'A medieval world showcasing advanced open world multiplayer features',
    needsRebuild: true
  },
  {
    id: '1570ae12-889a-11ec-886e-b126f7590685',
    name: 'ee-productivity',
    repositoryPath: 'https://github.com/etherealengine/ee-productivity',
    thumbnail: '/static/etherealengine.png',
    description: 'Utility and productivity tools for Virtual and Augmented Reality',
    needsRebuild: true
  },
  {
    id: '1570ae00-889a-11ec-886e-b126f7590685',
    name: 'ee-development-test-suite',
    repositoryPath: 'https://github.com/etherealengine/ee-development-test-suite',
    thumbnail: '/static/etherealengine.png',
    description: 'Assets and tests for Ethereal Engine core development',
    needsRebuild: true
  },
  {
    id: '1570ae01-889a-11ec-886e-b126f7590685',
    name: 'ee-i18n',
    repositoryPath: 'https://github.com/etherealengine/ee-i18n',
    thumbnail: '/static/etherealengine.png',
    description: 'Complete language translations in over 100 languages',
    needsRebuild: true
  },
  {
    id: '1570ae02-889a-11ec-886e-b126f7590685',
    name: 'ee-bot',
    repositoryPath: 'https://github.com/etherealengine/ee-bot',
    thumbnail: '/static/etherealengine.png',
    description: 'A test bot using puppeteer',
    needsRebuild: true
  },
  {
    id: '1570ae11-889a-11ec-886e-b126f7590685',
    name: 'ee-maps  ',
    repositoryPath: 'https://github.com/etherealengine/ee-maps',
    thumbnail: '/static/etherealengine.png',
    description: 'Procedurally generated map tiles using geojson data with mapbox and turf.js',
    needsRebuild: true
  }
  // {
  //   id: '1570ae12-889a-11ec-886e-b126f7590685',
  //   name: 'Inventory',
  //   repositoryPath: 'https://github.com/etherealengine/ee-inventory',
  //   thumbnail: '/static/etherealengine.png',
  //   description:
  //     'Item inventory, trade & virtual currency. Allow your users to use a database, IPFS, DID or blockchain backed item storage for equippables, wearables and tradable items.',
  //   needsRebuild: true
  // },
]

const CommunityProjectData = [] as any

const ProjectExpansionList = (props: React.PropsWithChildren<{ id: string; summary: string }>) => {
  return (
    <Accordion classes={{ root: styles.expansionList }} disableGutters defaultExpanded>
      <AccordionSummary
        id={props.id}
        classes={{
          root: styles.expansionSummary,
          content: styles.expansionSummaryContent,
          expanded: styles.expansionSummaryExpanded
        }}
      >
        <IconButton aria-label="menu" disableRipple>
          <ArrowRightRounded />
        </IconButton>
        <h3>{props.summary}</h3>
      </AccordionSummary>
      <AccordionDetails classes={{ root: styles.expansionDetail }}>{props.children}</AccordionDetails>
    </Accordion>
  )
}

const ProjectsPage = () => {
  const installedProjects = useHookstate<ProjectInterface[]>([]) // constant projects initialized with an empty array.
  const officialProjects = useHookstate<ProjectInterface[]>([])
  const communityProjects = useHookstate<ProjectInterface[]>([])
  const activeProject = useHookstate<ProjectInterface | null>(null)
  const loading = useHookstate(false)
  const error = useHookstate<Error | null>(null)
  const query = useHookstate('')
  const filterAnchorEl = useHookstate<any>(null)
  const projectAnchorEl = useHookstate<any>(null)
  const filter = useHookstate({ installed: false, official: true, community: true })
  const isCreateDialogOpen = useHookstate(false)
  const isDeleteDialogOpen = useHookstate(false)
  const updatingProject = useHookstate(false)
  const uploadingProject = useHookstate(false)
  const editPermissionsDialogOpen = useHookstate(false)
  const projectDrawerOpen = useHookstate(false)
  const changeDestination = useHookstate(false)

  const authState = useHookstate(getMutableState(AuthState))
  const projectState = useHookstate(getMutableState(ProjectState))
  const authUser = authState.authUser
  const user = authState.user

  const githubProvider = user.identityProviders.value?.find((ip) => ip.type === 'github')

  const { t } = useTranslation()
  const route = useRouter()

  const fetchInstalledProjects = async () => {
    loading.set(true)
    try {
      const data = await getProjects()
      installedProjects.set(data.sort(sortAlphabetical) ?? [])
      if (activeProject.value)
        activeProject.set(data.find((item) => item.id === activeProject.value?.id) as ProjectInterface | null)
    } catch (error) {
      logger.error(error)
      error.set(error)
    }
    loading.set(false)
  }

  const fetchOfficialProjects = async (query?: string) => {
    loading.set(true)
    try {
      const data = (
        query
          ? OfficialProjectData.filter((p) => p.name.includes(query) || p.description.includes(query))
          : OfficialProjectData
      ).filter((p) => !installedProjects.value?.find((ip) => ip.name.includes(p.name)))

      console.log(OfficialProjectData, installedProjects, data)
      officialProjects.set((data.sort(sortAlphabetical) as ProjectInterface[]) ?? [])
    } catch (error) {
      logger.error(error)
      error.set(error)
    }
    loading.set(false)
  }

  const fetchCommunityProjects = async (query?: string) => {
    loading.set(true)
    try {
      const data = (
        query
          ? CommunityProjectData.filter((p) => p.name.includes(query) || p.description.includes(query))
          : CommunityProjectData
      ).filter((p) => !installedProjects.value?.find((ip) => ip.name.includes(p.name)))

      communityProjects.set(data.sort(sortAlphabetical) ?? [])
    } catch (error) {
      logger.error(error)
      error.set(error)
    }
    loading.set(false)
  }

  useEffect(() => {
    fetchOfficialProjects()
    fetchCommunityProjects()
  }, [installedProjects])

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess()
    fetchInstalledProjects()
  }

  useEffect(() => {
    if (!authUser || !user) return
    if (authUser.accessToken.value == null || authUser.accessToken.value.length <= 0 || user.id.value == null) return

    fetchInstalledProjects()
    fetchOfficialProjects()
    fetchCommunityProjects()
  }, [authUser.accessToken])

  // TODO: Implement tutorial #7257
  const openTutorial = () => {
    logger.info('Implement Tutorial...')
  }

  const onClickExisting = (event, project) => {
    event.preventDefault()
    if (!isInstalled(project)) return

    dispatchAction(EditorAction.sceneChanged({ sceneName: null }))
    dispatchAction(EditorAction.projectChanged({ projectName: project.name }))
    route(`/studio/${project.name}`)
  }

  const onCreateProject = async (name) => {
    await ProjectService.createProject(name)
    await fetchInstalledProjects()
  }

  const onCreatePermission = async (userInviteCode: string, projectId: string) => {
    await ProjectService.createPermission(userInviteCode, projectId)
    await fetchInstalledProjects()
  }

  const onPatchPermission = async (id: string, type: string) => {
    await ProjectService.patchPermission(id, type)
    await fetchInstalledProjects()
  }

  const onRemovePermission = async (id: string) => {
    await ProjectService.removePermission(id)
    await fetchInstalledProjects()
  }

  const openDeleteConfirm = () => isDeleteDialogOpen.set(true)
  const closeDeleteConfirm = () => isDeleteDialogOpen.set(false)
  const openCreateDialog = () => isCreateDialogOpen.set(true)
  const closeCreateDialog = () => isCreateDialogOpen.set(false)
  const openEditPermissionsDialog = () => editPermissionsDialogOpen.set(true)
  const closeEditPermissionsDialog = () => editPermissionsDialogOpen.set(false)

  const deleteProject = async () => {
    closeDeleteConfirm()

    updatingProject.set(true)
    if (activeProject.value) {
      try {
        const proj = installedProjects.get({ noproxy: true }).find((proj) => proj.id === activeProject.value?.id)!
        await ProjectService.removeProject(proj.id)
        await fetchInstalledProjects()
      } catch (err) {
        logger.error(err)
      }
    }

    closeProjectContextMenu()
    updatingProject.set(false)
  }

  const pushProject = async (id: string) => {
    uploadingProject.set(true)
    try {
      await ProjectService.pushProject(id)
      await fetchInstalledProjects()
    } catch (err) {
      logger.error(err)
    }
    uploadingProject.set(false)
  }

  const isInstalled = (project: ProjectInterface | null) => {
    if (!project) return false

    for (const installedProject of installedProjects.value) {
      if (project.repositoryPath === installedProject.repositoryPath) return true
    }

    return false
  }

  const hasRepo = (project: ProjectInterface | null) => {
    if (!project) return false

    return project.repositoryPath && project.repositoryPath.length > 0
  }

  const handleSearch = (e) => {
    query.set(e.target.value)

    if (filter.value.installed) {
    }
    if (filter.value.official) fetchOfficialProjects(e.target.value)
    if (filter.value.community) fetchCommunityProjects(e.target.value)
  }

  const clearSearch = () => query.set('')
  const openFilterMenu = (e) => filterAnchorEl.set(e.target)
  const closeFilterMenu = () => filterAnchorEl.set(null)
  const toggleFilter = (type: string) => filter.set({ ...filter.value, [type]: !filter.value[type] })

  const openProjectContextMenu = (event: MouseEvent, project: ProjectInterface) => {
    event.preventDefault()
    event.stopPropagation()

    activeProject.set(JSON.parse(JSON.stringify(project)))
    projectAnchorEl.set(event.target)
  }

  const closeProjectContextMenu = () => projectAnchorEl.set(null)

  const renderProjectList = (projects: ProjectInterface[], areInstalledProjects?: boolean) => {
    if (!projects || projects.length <= 0) return <></>

    return (
      <ul className={styles.listContainer}>
        {projects.map((project: ProjectInterface, index) => (
          <li className={styles.itemContainer} key={index}>
            <a
              onClick={(e) => {
                areInstalledProjects ? onClickExisting(e, project) : window.open(project.repositoryPath)
              }}
            >
              <div
                className={styles.thumbnailContainer}
                style={{ backgroundImage: `url(${project.thumbnail ?? '/static/etherealengine_thumbnail.jpg'})` }}
                id={'open-' + project.name}
              />
            </a>
            <div className={styles.headerContainer} id={'headerContainer-' + project.name}>
              <h3 className={styles.header}>{project.name.replace(/-/g, ' ')}</h3>
              {project.name !== 'default-project' && (
                <IconButton
                  className={styles.iconButton}
                  disableRipple
                  onClick={(e: any) => openProjectContextMenu(e, project)}
                >
                  <Settings />
                </IconButton>
              )}
            </div>
            {!areInstalledProjects && isInstalled(project) && (
              <span className={styles.installedIcon}>
                <DownloadDone />
              </span>
            )}
            {project.description && (
              <p className={styles.description} id={'description-' + project.name}>
                {project.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    )
  }

  const handleOpenProjectDrawer = (change = false) => {
    projectDrawerOpen.set(true)
    changeDestination.set(change)
  }

  const handleCloseProjectDrawer = () => {
    changeDestination.set(false)
    projectDrawerOpen.set(false)
  }

  /**
   * Rendering view for projects page, if user is not login yet then showing login view.
   * if user is logged in and has no existing projects then the welcome view is shown, providing link to the tutorials.
   * if user has existing projects then we show the existing projects in grids and a grid to add new project.
   *
   */
  if (!authUser?.accessToken.value || authUser.accessToken.value.length === 0 || !user?.id.value) return <></>

  return (
    <main className={styles.projectPage}>
      <style>
        {`
        #menu-projectURL,
        #menu-branchData,
        #menu-commitData {
          z-index: 1500;
        }
        #engine-container {
          display: flex;
          flex-direction: column;
        }
        `}
      </style>
      <div className={styles.projectPageContainer}>
        <div className={styles.projectGridContainer}>
          <div className={styles.projectGridHeader}>
            <h2>{t(`editor.projects.title`)}</h2>
            <Paper component="form" classes={{ root: styles.searchInputRoot }}>
              <IconButton aria-label="menu" disableRipple onClick={openFilterMenu}>
                <FilterList />
              </IconButton>
              <Menu
                anchorEl={filterAnchorEl.value}
                open={Boolean(filterAnchorEl.value)}
                onClose={closeFilterMenu}
                classes={{ paper: styles.filterMenu }}
              >
                <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => toggleFilter('installed')}>
                  {filter.value.installed && <Check />}
                  {t(`editor.projects.installed`)}
                </MenuItem>
                <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => toggleFilter('official')}>
                  {filter.value.official && <Check />}
                  {t(`editor.projects.official`)}
                </MenuItem>
                <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => toggleFilter('community')}>
                  {filter.value.community && <Check />}
                  {t(`editor.projects.community`)}
                </MenuItem>
              </Menu>
              <InputBase
                value={query.value}
                classes={{ root: styles.inputRoot }}
                placeholder={t(`editor.projects.lbl-searchProject`)}
                inputProps={{ 'aria-label': t(`editor.projects.lbl-searchProject`) }}
                onChange={handleSearch}
              />
              {query.value ? (
                <IconButton aria-label="search" disableRipple onClick={clearSearch}>
                  <Clear />
                </IconButton>
              ) : (
                <IconButton aria-label="search" disableRipple>
                  <Search />
                </IconButton>
              )}
            </Paper>
            <div className={styles.buttonContainer}>
              {githubProvider != null && (
                <MuiButton
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
                </MuiButton>
              )}
              <Button onClick={() => handleOpenProjectDrawer(false)} className={styles.btn}>
                {t(`editor.projects.install`)}
              </Button>
              <Button onClick={openCreateDialog} className={styles.btn}>
                {t(`editor.projects.lbl-createProject`)}
              </Button>
            </div>
          </div>
          <div className={styles.projectGrid}>
            {error.value && <div className={styles.errorMsg}>{error.value.message}</div>}
            {(!query.value || filter.value.installed) && (
              <ProjectExpansionList
                id={t(`editor.projects.installed`)}
                summary={`${t('editor.projects.installed')} (${installedProjects.value.length})`}
              >
                {renderProjectList(installedProjects.value, true)}
              </ProjectExpansionList>
            )}
            {(!query.value || (query.value && filter.value.official && officialProjects.value.length > 0)) && (
              <ProjectExpansionList
                id={t(`editor.projects.official`)}
                summary={`${t('editor.projects.official')} (${officialProjects.value.length})`}
              >
                {renderProjectList(officialProjects.value)}
              </ProjectExpansionList>
            )}
            {(!query.value || (!query.value && filter.value.community && communityProjects.value.length > 0)) && (
              <ProjectExpansionList
                id={t(`editor.projects.community`)}
                summary={`${t('editor.projects.community')} (${communityProjects.value.length})`}
              >
                {renderProjectList(communityProjects.value)}
              </ProjectExpansionList>
            )}
          </div>
        </div>
        {installedProjects.value.length < 2 && !loading ? (
          <div className={styles.welcomeContainer}>
            <h1>{t('editor.projects.welcomeMsg')}</h1>
            <h2>{t('editor.projects.description')}</h2>
            <MediumButton onClick={openTutorial}>{t('editor.projects.lbl-startTutorial')}</MediumButton>
          </div>
        ) : null}
      </div>
      {activeProject.value?.name !== 'default-project' && (
        <Menu
          anchorEl={projectAnchorEl.value}
          open={Boolean(projectAnchorEl.value)}
          onClose={closeProjectContextMenu}
          TransitionProps={{ onExited: () => activeProject.set(null) }}
          classes={{ paper: styles.filterMenu }}
        >
          {activeProject.value && isInstalled(activeProject.value) && (
            <MenuItem classes={{ root: styles.filterMenuItem }} onClick={openEditPermissionsDialog}>
              <Group />
              {t(`editor.projects.permissions`)}
            </MenuItem>
          )}
          {activeProject.value &&
            isInstalled(activeProject.value) &&
            hasRepo(activeProject.value) &&
            activeProject.value.hasWriteAccess && (
              <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => handleOpenProjectDrawer(false)}>
                <Download />
                {t(`editor.projects.updateFromGithub`)}
              </MenuItem>
            )}
          {activeProject.value &&
            isInstalled(activeProject.value) &&
            !hasRepo(activeProject.value) &&
            activeProject.value.hasWriteAccess && (
              <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => handleOpenProjectDrawer(true)}>
                <Link />
                {t(`editor.projects.link`)}
              </MenuItem>
            )}
          {activeProject.value &&
            isInstalled(activeProject.value) &&
            hasRepo(activeProject.value) &&
            activeProject.value.hasWriteAccess && (
              <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => handleOpenProjectDrawer(true)}>
                <LinkOff />
                {t(`editor.projects.unlink`)}
              </MenuItem>
            )}
          {activeProject.value?.hasWriteAccess && hasRepo(activeProject.value) && (
            <MenuItem
              classes={{ root: styles.filterMenuItem }}
              onClick={() => activeProject?.value?.id && pushProject(activeProject.value.id)}
            >
              {uploadingProject.value ? <CircularProgress size={15} className={styles.progressbar} /> : <Upload />}
              {t(`editor.projects.pushToGithub`)}
            </MenuItem>
          )}
          {isInstalled(activeProject.value) && activeProject.value?.hasWriteAccess && (
            <MenuItem classes={{ root: styles.filterMenuItem }} onClick={openDeleteConfirm}>
              {updatingProject.value ? <CircularProgress size={15} className={styles.progressbar} /> : <Delete />}
              {t(`editor.projects.uninstall`)}
            </MenuItem>
          )}
          {!isInstalled(activeProject.value) && (
            <MenuItem classes={{ root: styles.filterMenuItem }} onClick={() => handleOpenProjectDrawer(false)}>
              {updatingProject.value ? <CircularProgress size={15} className={styles.progressbar} /> : <Download />}
              {t(`editor.projects.install`)}
            </MenuItem>
          )}
        </Menu>
      )}
      <CreateProjectDialog open={isCreateDialogOpen.value} onSuccess={onCreateProject} onClose={closeCreateDialog} />
      {activeProject.value && activeProject.value.project_permissions && (
        <EditPermissionsDialog
          open={editPermissionsDialogOpen.value}
          onClose={closeEditPermissionsDialog}
          project={activeProject.value}
          projectPermissions={activeProject.value.project_permissions}
          addPermission={onCreatePermission}
          patchPermission={onPatchPermission}
          removePermission={onRemovePermission}
        />
      )}
      <ProjectDrawer
        open={projectDrawerOpen.value}
        inputProject={activeProject.value}
        existingProject={activeProject.value != null}
        onClose={handleCloseProjectDrawer}
        changeDestination={changeDestination.value}
      />
      <DeleteDialog
        open={isDeleteDialogOpen.value}
        isProjectMenu
        onCancel={closeDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={deleteProject}
      />
    </main>
  )
}

export default ProjectsPage
