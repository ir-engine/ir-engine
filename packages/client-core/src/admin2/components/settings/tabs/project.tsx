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

import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { ProjectSettingType, projectPath } from '@etherealengine/common/src/schema.type.module'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { loadConfigForProject } from '@etherealengine/projects/loadConfigForProject'
import { useGet, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Select from '@etherealengine/ui/src/primitives/tailwind/Select'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

const ProjectTab = forwardRef((props, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const projectState = useHookstate(getMutableState(ProjectState))
  const projects = projectState.projects
  const settings = useHookstate<Array<ProjectSettingType> | []>([])
  const selectedProject = useHookstate(projects.get(NO_PROXY).length > 0 ? projects.get(NO_PROXY)[0].id : '')
  const project = useGet(projectPath, selectedProject.value, { query: { $select: ['settings'] } }).data
  let projectSetting = project?.settings || []

  const patchProjectSetting = useMutation(projectPath).patch

  useEffect(() => {
    ProjectService.fetchProjects()
  }, [])

  const projectsMenu = projects.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const resetSettingsFromSchema = async () => {
    const projectName = projects.value.filter((proj) => proj.id === selectedProject.value)
    const projectConfig = projectName?.length > 0 && (await loadConfigForProject(projectName[0].name))

    if (projectConfig && projectConfig?.settings) {
      const tempSetting = [] as ProjectSettingType[]

      for (const setting of projectConfig.settings) {
        tempSetting.push({ key: setting.key, value: '' })
      }

      settings.set(tempSetting)
    } else {
      settings.set([])
    }
  }

  useEffect(() => {
    if (selectedProject.value) {
      resetSettingsFromSchema()
    }
  }, [selectedProject])

  return (
    <Accordion
      title={t('admin:components.setting.project')}
      subtitle="Edit Project Settings"
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
    >
      <Select
        options={projectsMenu}
        currentValue={selectedProject.value}
        onChange={(value) => {
          selectedProject.set(value)
        }}
        // label={t('admin:components.setting.project')}
        className="mt-6 max-w-[50%]"
      />
    </Accordion>
  )
})

export default ProjectTab
