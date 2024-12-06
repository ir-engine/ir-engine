/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import AddEditProjectModal from '@ir-engine/client-core/src/admin/components/project/AddEditProjectModal'
import ManageUserPermissionModal from '@ir-engine/client-core/src/admin/components/project/ManageUserPermissionModal'
import { ProjectUpdateState } from '@ir-engine/client-core/src/admin/services/ProjectUpdateService'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@ir-engine/client-core/src/common/services/ProjectService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useFind } from '@ir-engine/common'
import multiLogger from '@ir-engine/common/src/logger'
import {
  ProjectType,
  ScopeType,
  identityProviderPath,
  projectPath,
  scopePath
} from '@ir-engine/common/src/schema.type.module'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { Engine } from '@ir-engine/ecs'
import { Button, Checkbox, Input, Tooltip } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdArrowDropDown,
  MdArrowRight,
  MdDownload,
  MdDownloadDone,
  MdFilterList,
  MdGroup,
  MdLink,
  MdLinkOff,
  MdOutlineSearch,
  MdSettings,
  MdUpload
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { EditorState } from '../../services/EditorServices'

const logger = multiLogger.child({ component: 'editor:ProjectsPage' })

function sortAlphabetical(a, b) {
  if (a > b) return -1
  if (b > a) return 1
  return 0
}

function clipText(text: string, length: number, clipFrom: 'start' | 'end' = 'end') {
  if (text.length <= length) return text
  if (clipFrom === 'start') return '...' + text.slice(text.length - length)
  return text.slice(0, length) + '...'
}

const OFFICIAL_PROJECTS_DATA = [
  // {
  //   id: '1570ae14-889a-11ec-886e-b126f7590685',
  //   name: 'ee-ethereal-village',
  //   repositoryPath: 'https://github.com/ir-engine/ee-ethereal-village',
  //   thumbnail: 'https://media.githubusercontent.com/media/ir-engine/ee-ethereal-village/dev/thumbnail.png',
  //   description: 'A medieval world showcasing advanced open world multiplayer features',
  //   needsRebuild: true
  // },
  // {
  //   id: '1570ae12-889a-11ec-886e-b126f7590685',
  //   name: 'ee-productivity',
  //   repositoryPath: 'https://github.com/ir-engine/ee-productivity',
  //   thumbnail: '/static/IR_thumbnail.jpg',
  //   description: 'Utility and productivity tools for Virtual and Augmented Reality',
  //   needsRebuild: true
  // },
  {
    id: '1570ae00-889a-11ec-886e-b126f7590685',
    name: 'ir-development-test-suite',
    repositoryPath: 'https://github.com/ir-engine/ir-development-test-suite',
    thumbnail: '/static/IR_thumbnail.jpg',
    description: 'Assets and tests for Infinite Reality Engine core development',
    needsRebuild: true
  },
  // {
  //   id: '1570ae01-889a-11ec-886e-b126f7590685',
  //   name: 'ee-i18n',
  //   repositoryPath: 'https://github.com/ir-engine/ee-i18n',
  //   thumbnail: '/static/IR_thumbnail.jpg',
  //   description: 'Complete language translations in over 100 languages',
  //   needsRebuild: true
  // },
  {
    id: '1570ae02-889a-11ec-886e-b126f7590685',
    name: 'ir-bot',
    repositoryPath: 'https://github.com/ir-engine/ir-bot',
    thumbnail: '/static/IR_thumbnail.jpg',
    description: 'A test bot using puppeteer',
    needsRebuild: true
  }
  // {
  //   id: '1570ae11-889a-11ec-886e-b126f7590685',
  //   name: 'ee-maps  ',
  //   repositoryPath: 'https://github.com/ir-engine/ee-maps',
  //   thumbnail: '/static/IR_thumbnail.jpg',
  //   description: 'Procedurally generated map tiles using geojson data with mapbox and turf.js',
  //   needsRebuild: true
  // }
  // {
  //   id: '1570ae12-889a-11ec-886e-b126f7590685',
  //   name: 'Inventory',
  //   repositoryPath: 'https://github.com/ir-engine/ee-inventory',
  //   thumbnail: '/static/IR_thumbnail.jpg',
  //   description:
  //     'Item inventory, trade & virtual currency. Allow your users to use a database, IPFS, DID or blockchain backed item storage for equippables, wearables and tradable items.',
  //   needsRebuild: true
  // },
]

const COMMUNITY_PROJECTS_DATA = [] as typeof OFFICIAL_PROJECTS_DATA

const ProjectPage = ({ studioPath }: { studioPath: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useHookstate({ local: '', query: '' })
  const searchTimeoutCancelRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const projectCategoryFilter = useHookstate({ installed: true, official: true, community: true })
  const [searchContextEvent, setSearchContextEvent] = useState<React.MouseEvent<HTMLElement> | undefined>(undefined)

  const refreshingGithubRepoAccess = useHookstate(false)

  const [projectContextState, setProjectContextState] = useState({
    event: undefined,
    project: null
  } as {
    event: React.MouseEvent<HTMLElement> | undefined
    project: ProjectType | null
  })

  const projectFindQuery = useFind(projectPath, {
    query: {
      /** @todo - add pagination to UI */
      $limit: 1000,
      action: 'studio',
      allowed: true,
      ...(!!search.query.value && { name: { $like: `%${search.query.value}%` } }),
      $sort: { name: 1 }
    }
  })

  const adminScopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.store.userID,
      type: 'admin:admin' as ScopeType
    }
  })

  const hasAdminAccess = adminScopeQuery.data.length > 0

  const editorScopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.store.userID,
      type: 'projects:write' as ScopeType
    }
  })

  const hasProjectAccess = editorScopeQuery.data.length > 0

  const hasWriteAccess = projectContextState.project?.hasWriteAccess || (hasAdminAccess && hasProjectAccess)

  const installedProjects = projectFindQuery.data.filter(() => projectCategoryFilter.installed.value)

  const officialProjects = (
    search.query.value
      ? OFFICIAL_PROJECTS_DATA.filter(
          (p) => p.name.includes(search.query.value) || p.description.includes(search.query.value)
        )
      : OFFICIAL_PROJECTS_DATA
  )
    .filter(() => projectCategoryFilter.official.value)
    .filter((p) => !installedProjects?.find((ip) => ip.name.includes(p.name))) as ProjectType[]
  officialProjects.sort(sortAlphabetical)

  const communityProjects = (
    search.query.value
      ? COMMUNITY_PROJECTS_DATA.filter(
          (p) => p.name.includes(search.query.value) || p.description.includes(search.query.value)
        )
      : COMMUNITY_PROJECTS_DATA
  )
    .filter(() => projectCategoryFilter.community.value)
    .filter((p) => !installedProjects?.find((ip) => ip.name.includes(p.name))) as ProjectType[]
  communityProjects.sort(sortAlphabetical)

  const uploadingProject = useHookstate(false)

  const pushProject = async (id: string) => {
    uploadingProject.set(true)
    try {
      await ProjectService.pushProject(id)
      projectFindQuery.refetch()
    } catch (err) {
      logger.error(err)
    }
    uploadingProject.set(false)
  }

  const isInstalled = (project: ProjectType | null) => {
    if (!project) return false
    return !!installedProjects.find((p) => p.repositoryPath === project.repositoryPath)
  }

  const hasRepo = (project: ProjectType | null) => {
    if (!project) return false
    return project.repositoryPath && project.repositoryPath.length > 0
  }

  const handleSearch = (searchedText: string) => {
    search.local.set(searchedText)
    if (searchTimeoutCancelRef.current) {
      clearTimeout(searchTimeoutCancelRef.current)
    }
    searchTimeoutCancelRef.current = setTimeout(() => {
      search.query.set(searchedText.replace(' ', '-'))
    }, 100)
  }

  const onClickExisting = (event, project) => {
    event.preventDefault()
    if (!isInstalled(project)) return
    navigate(`${studioPath}?project=${project.name}`)
    getMutableState(EditorState).projectName.set(project.name)
    const parsed = new URL(window.location.href)
    const query = parsed.searchParams
    query.set('project', project.name)
    parsed.search = query.toString()
    if (typeof history.pushState !== 'undefined') {
      window.history.replaceState({}, '', parsed.toString())
    }
  }

  const handleProjectUpdate = async () => {
    if (!projectContextState.project) return
    const project = projectContextState.project
    const projectUpdateStatus = getMutableState(ProjectUpdateState)[project.name].value
    await ProjectService.uploadProject({
      sourceURL: projectUpdateStatus.sourceURL,
      destinationURL: projectUpdateStatus.destinationURL,
      name: project.name,
      reset: true,
      commitSHA: projectUpdateStatus.selectedSHA,
      sourceBranch: projectUpdateStatus.selectedBranch,
      updateType: projectUpdateStatus.updateType,
      updateSchedule: projectUpdateStatus.updateSchedule
    }).catch((err) => {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    })
    PopoverState.hidePopupover()
  }

  const renderProjectList = (projects: ProjectType[], areInstalledProjects?: boolean) => {
    return (
      <div className="grid grid-cols-6 gap-2">
        {projects.map((project, index) => (
          <div className="col-span-1" key={index}>
            <button
              onClick={(e) => {
                areInstalledProjects ? onClickExisting(e, project) : window.open(project.repositoryPath)
              }}
            >
              <img
                onError={({ currentTarget }) => {
                  currentTarget.src = '/static/IR_thumbnail.jpg'
                }}
                className="h-auto w-full bg-cover bg-center bg-no-repeat"
                src={project.thumbnail}
              />
            </button>

            <div className="relative flex w-full items-center px-2">
              <Tooltip content={project.name}>
                <Text component="h3">{clipText(project.name.replace(/-/g, ' '), 25, 'start')}</Text>
              </Tooltip>

              {project.name !== 'ir-engine/default-project' && (
                <button
                  className="absolute right-2"
                  onClick={(e: any) => {
                    setProjectContextState({
                      event: e,
                      project
                    })
                  }}
                >
                  <MdSettings />
                </button>
              )}
            </div>
            {!areInstalledProjects && isInstalled(project) && (
              <span>
                <MdDownloadDone />
              </span>
            )}
            {project.description && (
              <Text className="w-full text-wrap text-center" fontSize="sm">
                {project.description}
              </Text>
            )}
          </div>
        ))}
      </div>
    )
  }

  const toggleFilter = (type: string) =>
    projectCategoryFilter.set({ ...projectCategoryFilter.value, [type]: !projectCategoryFilter.value[type] })

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess().then(() => {
      projectFindQuery.refetch()
    })
  }

  const authState = useMutableState(AuthState)
  const authUser = authState.authUser
  const user = authState.user
  const identityProvidersQuery = useFind(identityProviderPath)
  const githubProvider = identityProvidersQuery.data.find((ip) => ip.type === 'github')

  if (!authUser?.accessToken.value || authUser.accessToken.value.length === 0 || !user?.id.value) return <></>

  return (
    <main className="pointer-events-auto flex h-full w-full flex-col items-center overflow-y-auto px-5 py-3">
      <div className="flex w-2/3 items-center justify-around gap-x-2">
        <Input
          onChange={(e) => {
            handleSearch(e.target.value)
          }}
          value={search.local.value}
          // label={t('editor.projects.lbl-searchProject')}
          startComponent={
            <button
              onClick={(e) => {
                setSearchContextEvent(e)
              }}
            >
              <MdFilterList className="text-2xl" />
            </button>
          }
          endComponent={<MdOutlineSearch className="text-2xl" />}
        />

        <div className="flex items-center justify-between gap-3">
          {githubProvider && (
            <Button onClick={refreshGithubRepoAccess} variant="tertiary">
              {refreshingGithubRepoAccess.value ? (
                <>
                  <LoadingView className="mr-2 h-10 w-10" />
                  {t('admin:components.project.refreshingGithubRepoAccess')}
                </>
              ) : (
                t('admin:components.project.refreshGithubRepoAccess')
              )}
            </Button>
          )}

          <Button
            onClick={() => {
              PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleProjectUpdate} update={false} />)
            }}
            variant="tertiary"
          >
            {t('editor.projects.install')}
          </Button>
        </div>
      </div>

      <ContextMenu
        anchorEvent={searchContextEvent}
        onClose={() => {
          setSearchContextEvent(undefined)
        }}
      >
        <div className="flex w-fit flex-col gap-4 rounded-lg border bg-neutral-900 p-2 shadow-lg">
          <Checkbox
            label={t('editor.projects.installed')}
            checked={projectCategoryFilter.installed.value}
            onChange={() => toggleFilter('installed')}
          />
          <Checkbox
            label={t('editor.projects.official')}
            checked={projectCategoryFilter.official.value}
            onChange={() => toggleFilter('official')}
          />
          <Checkbox
            label={t('editor.projects.community')}
            checked={projectCategoryFilter.community.value}
            onChange={() => toggleFilter('community')}
          />
        </div>
      </ContextMenu>

      {installedProjects.length > 0 && (
        <Accordion
          title={`${t('editor.projects.installed')} (${installedProjects.length})`}
          expandIcon={<MdArrowRight className="text-2xl" />}
          shrinkIcon={<MdArrowDropDown className="text-2xl" />}
          className="mb-3 mt-5 w-3/4"
          open={true}
        >
          {renderProjectList(installedProjects, true)}
        </Accordion>
      )}

      {officialProjects.length > 0 && (
        <Accordion
          title={`${t('editor.projects.official')} (${officialProjects.length})`}
          expandIcon={<MdArrowRight className="text-2xl" />}
          shrinkIcon={<MdArrowDropDown className="text-2xl" />}
          className="mb-3 w-3/4"
          open={true}
        >
          {renderProjectList(officialProjects)}
        </Accordion>
      )}

      {communityProjects.length > 0 && (
        <Accordion
          title={`${t('editor.projects.community')} (${communityProjects.length})`}
          expandIcon={<MdArrowRight className="text-2xl" />}
          shrinkIcon={<MdArrowDropDown className="text-2xl" />}
          className="w-3/4"
          open={true}
        >
          {renderProjectList(communityProjects)}
        </Accordion>
      )}

      <ContextMenu
        anchorEvent={projectContextState.event}
        onClose={() => {
          setProjectContextState({ event: undefined, project: null })
        }}
      >
        <div className="flex w-fit flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
          {projectContextState.project && isInstalled(projectContextState.project) && (
            <Button
              onClick={() => {
                if (projectContextState.project) {
                  setProjectContextState({ event: undefined, project: null })
                  PopoverState.showPopupover(<ManageUserPermissionModal project={projectContextState.project} />)
                }
              }}
              variant="tertiary"
              fullWidth
            >
              <MdGroup className="text-2xl" />
              {t('editor.projects.permissions')}
            </Button>
          )}

          {projectContextState.project &&
            isInstalled(projectContextState.project) &&
            hasRepo(projectContextState.project) &&
            hasWriteAccess && (
              <Button
                onClick={() => {
                  if (projectContextState.project) {
                    setProjectContextState({ event: undefined, project: null })
                    PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleProjectUpdate} update={true} />)
                  }
                }}
                variant="tertiary"
                fullWidth
              >
                <MdDownload className="text-2xl" />
                {t('editor.projects.updateFromGithub')}
              </Button>
            )}

          {projectContextState.project &&
            isInstalled(projectContextState.project) &&
            !hasRepo(projectContextState.project) &&
            hasWriteAccess && (
              <Button
                onClick={() => {
                  if (projectContextState.project) {
                    setProjectContextState({ event: undefined, project: null })
                    PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleProjectUpdate} update={true} />)
                  }
                }}
                variant="tertiary"
                fullWidth
              >
                <MdLink className="text-2xl" />
                {t('editor.projects.link')}
              </Button>
            )}

          {projectContextState.project &&
            isInstalled(projectContextState.project) &&
            hasRepo(projectContextState.project) &&
            hasWriteAccess && (
              <Button
                onClick={() => {
                  if (projectContextState.project) {
                    setProjectContextState({ event: undefined, project: null })
                    PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleProjectUpdate} update={true} />)
                  }
                }}
                variant="tertiary"
                fullWidth
              >
                <MdLinkOff className="text-2xl" />
                {t('editor.projects.unlink')}
              </Button>
            )}

          {isInstalled(projectContextState.project) && hasWriteAccess && hasRepo(projectContextState.project) && (
            <Button
              onClick={() => projectContextState.project?.id && pushProject(projectContextState.project?.id)}
              variant="tertiary"
              fullWidth
            >
              {uploadingProject.value ? <LoadingView className="h-6 w-6" /> : <MdUpload />}
              {t('editor.projects.pushToGithub')}
            </Button>
          )}

          {!isInstalled(projectContextState.project) && (
            <Button
              onClick={() => {
                setProjectContextState({ event: undefined, project: null })
                PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleProjectUpdate} update={false} />)
              }}
              variant="tertiary"
              fullWidth
            >
              <MdDownload className="text-2xl" />
              {t(`editor.projects.install`)}
            </Button>
          )}
        </div>
      </ContextMenu>
      <PopupMenu />
    </main>
  )
}

export default ProjectPage
