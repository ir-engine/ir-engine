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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

import { isDev } from '@ir-engine/common/src/config'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import Badge from '@ir-engine/ui/src/primitives/tailwind/Badge'
import Tabs from '@ir-engine/ui/src/primitives/tailwind/Tabs'

import { useFind } from '@ir-engine/common'
import { ScopeType, scopePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import { ProjectService, ProjectState } from '../../../common/services/ProjectService'
import ProjectTable from './ProjectTable'
import ProjectTopMenu from './ProjectTopMenu'
import BuildStatusTable from './build-status/BuildStatusTable'

export default function AdminProject() {
  const { t } = useTranslation()
  const search = useHookstate({ local: '', query: '' })

  const projectState = useMutableState(ProjectState)

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.store.userID,
      type: 'projects:read' as ScopeType
    }
  })

  ProjectService.useAPIListeners()

  useEffect(() => {
    if (scopeQuery.data.length > 0) {
      ProjectService.getBuilderInfo()
    }
  }, [scopeQuery.data.length > 0])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    ProjectService.checkReloadStatus()

    if (projectState.rebuilding.value) {
      interval = setInterval(ProjectService.checkReloadStatus, 10000)
    } else {
      if (interval) clearInterval(interval)
      ProjectService.fetchProjects()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [projectState.rebuilding.value])

  return (
    <>
      <div className="mb-2 flex justify-start gap-3">
        {projectState.builderInfo.engineVersion.value && (
          <Badge
            label={t('admin:components.project.currentEngineVersion', {
              version: projectState.builderInfo.engineVersion.value
            })}
            variant="neutral"
            className="py-2"
          />
        )}

        {projectState.builderInfo.engineCommit.value && (
          <Badge
            label={t('admin:components.project.currentEngineCommit', {
              commit: projectState.builderInfo.engineCommit.value
            })}
            variant="neutral"
            className="py-2"
          />
        )}
      </div>
      <Tabs
        tabsData={[
          {
            title: t('admin:components.project.project'),
            tabLabel: t('admin:components.common.all'),
            rightComponent: <ProjectTopMenu />,
            bottomComponent: <ProjectTable search={search.query.value} />,
            topComponent: (
              <div className="mb-4 flex justify-between">
                <SearchBar search={search} />
              </div>
            )
          },
          {
            title: t('admin:components.buildStatus.buildStatus'),
            tabLabel: (
              <span className="flex items-center gap-5">
                {t('admin:components.project.buildStatus')}
                {!isDev && (
                  <div
                    className={twMerge(
                      'inline h-3 w-3 rounded-full',
                      projectState.succeeded.value === true
                        ? 'bg-green-500'
                        : projectState.failed.value === true
                        ? 'bg-red-500'
                        : projectState.rebuilding.value === true
                        ? 'bg-yellow-500'
                        : 'hidden'
                    )}
                  />
                )}
              </span>
            ),
            bottomComponent: <BuildStatusTable />,
            disabled: false //config.client.localBuildOrDev
          }
        ]}
        tabcontainerClassName="bg-theme-primary"
      />
    </>
  )
}
