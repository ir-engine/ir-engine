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

import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { ProjectService, ProjectState } from '@etherealengine/client-core/src/common/services/ProjectService'
import { ProjectSettingType, projectPath, projectSettingPath } from '@etherealengine/common/src/schema.type.module'
import { NO_PROXY, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { useGet, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Accordion from '@etherealengine/ui/src/primitives/tailwind/Accordion'
import Badge from '@etherealengine/ui/src/primitives/tailwind/Badge'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import LoadingView from '@etherealengine/ui/src/primitives/tailwind/LoadingView'
import Select from '@etherealengine/ui/src/primitives/tailwind/Select'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@etherealengine/ui/src/primitives/tailwind/Tooltip'
import { HiUser } from 'react-icons/hi2'

const ProjectTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })
  const projectState = useMutableState(ProjectState)
  const projects = projectState.projects

  const updatedSettings = useHookstate<ProjectSettingType[]>([])
  const selectedProjectId = useHookstate(projects.get(NO_PROXY).length > 0 ? projects.get(NO_PROXY)[0].id : '')

  const project = useGet(projectPath, selectedProjectId.value, { query: { $select: ['settings'] } })

  const patchProjectSetting = useMutation(projectSettingPath).patch

  useEffect(() => {
    ProjectService.fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId.value) {
      updatedSettings.set([])
    }
  }, [selectedProjectId])

  const handleClear = () => {
    updatedSettings.set([])
  }

  const handleSubmit = async () => {
    try {
      state.loading.set(true)
      for (const updatedSetting of updatedSettings.value) {
        await patchProjectSetting(
          updatedSetting.id,
          { value: updatedSetting.value },
          {
            query: {
              projectId: selectedProjectId.value
            }
          }
        )
      }
      state.set({ loading: false, errorMessage: '' })
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
    }
  }

  const projectsMenu = projects.value.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>, setting: ProjectSettingType) => {
    const index = updatedSettings.value.findIndex((item) => item.id === setting.id)
    if (index === -1) {
      updatedSettings.set([...updatedSettings.value, { ...setting, value: e.target.value }])
    } else {
      updatedSettings[index].nested('value').set(e.target.value)
    }
  }

  const displayedSettings = JSON.parse(JSON.stringify(project.data?.settings || [])) as ProjectSettingType[]
  for (const updatedSetting of updatedSettings.value) {
    const index = displayedSettings.findIndex((setting) => setting.id === updatedSetting.id)

    if (index !== -1) {
      displayedSettings[index] = updatedSetting
    }
  }

  return (
    <Accordion
      title={t('admin:components.setting.project.header')}
      subtitle={t('admin:components.setting.project.subtitle')}
      expandIcon={<HiPlusSmall />}
      shrinkIcon={<HiMinus />}
      ref={ref}
      open={open}
    >
      <Select
        options={projectsMenu}
        currentValue={selectedProjectId.value}
        onChange={(value) => selectedProjectId.set(value)}
        label={t('admin:components.setting.project.header')}
        className="mb-8 mt-6 max-w-[50%]"
      />

      {displayedSettings.length > 0 ? (
        <>
          {displayedSettings.map((setting: ProjectSettingType, index: number) => (
            <div className="mb-3 grid grid-cols-2 gap-2" key={index}>
              <Input
                className="col-span-1"
                label="Key Name"
                value={setting.key}
                endComponent={
                  <Badge
                    className="mr-2 rounded"
                    variant={setting.type === 'private' ? 'success' : 'warning'}
                    label={setting.type}
                  />
                }
                disabled
              />
              <Input
                className="col-span-1"
                label="Value"
                value={setting.value || ''}
                endComponent={
                  setting.userId && (
                    <Tooltip
                      title={t('admin:components.setting.project.lastUpdatedBy', { userId: setting.userId })}
                      direction="left"
                    >
                      <HiUser className="mr-2" />
                    </Tooltip>
                  )
                }
                onChange={(e) => handleSettingsChange(e, setting)}
              />
            </div>
          ))}
          <div className="mb-3 grid grid-cols-8 gap-2">
            <Button size="small" className="text-primary col-span-1 bg-theme-highlight" fullWidth onClick={handleClear}>
              {t('admin:components.setting.project.clear')}
            </Button>
            <Button
              size="small"
              className="col-span-1"
              fullWidth
              onClick={handleSubmit}
              startIcon={state.loading.value && <LoadingView spinnerOnly className="h-8 w-8" />}
            >
              {t('admin:components.setting.project.submit')}
            </Button>
          </div>
        </>
      ) : (
        <Text component="h3" className="text-red-700">
          {t('admin:components.setting.project.noSettingsMessage')}
        </Text>
      )}

      {state.errorMessage.value && (
        <Text component="h3" className="text-red-700">
          {state.errorMessage.value}
        </Text>
      )}
    </Accordion>
  )
})

export default ProjectTab
