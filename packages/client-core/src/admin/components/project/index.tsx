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

import config, { isDev } from '@etherealengine/common/src/config'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Badge from '@etherealengine/ui/src/primitives/tailwind/Badge'
import Tabs from '@etherealengine/ui/src/primitives/tailwind/Tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ProjectState } from '../../../common/services/ProjectService'
import ProjectTable from './ProjectTable'
import ProjectTopMenu from './ProjectTopMenu'
import BuildStatusTable from './build-status/BuildStatusTable'

export default function AdminProject() {
  const { t } = useTranslation()

  const projectState = useHookstate(getMutableState(ProjectState))
  console.log('debug1 the project state', projectState)

  return (
    <>
      <div className="mb-2 flex justify-start gap-3">
        {projectState.builderInfo.engineVersion.value && (
          <Badge
            label={`Current Engine Version: ${projectState.builderInfo.engineVersion.value}`}
            variant="neutral"
            className="py-2"
          />
        )}

        {projectState.builderInfo.engineCommit.value && (
          <Badge
            label={`Current Engine Commit: ${projectState.builderInfo.engineCommit.value}`}
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
            bottomComponent: <ProjectTable />
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
                        : 'bg-yellow-400'
                    )}
                  />
                )}
              </span>
            ),
            bottomComponent: <BuildStatusTable />,
            disabled: config.client.localBuildOrDev
          }
        ]}
        tabcontainerClassName="bg-theme-primary"
      />
    </>
  )
}
