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

import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import { useFind, useGet, useMutation } from '@ir-engine/common'
import { ProjectSettingType, projectPath, projectSettingPath } from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Accordion from '@ir-engine/ui/src/primitives/tailwind/Accordion'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import { HiTrash, HiUser } from 'react-icons/hi2'

const ProjectTab = forwardRef(({ open }: { open: boolean }, ref: React.MutableRefObject<HTMLDivElement>) => {
  const { t } = useTranslation()
  const state = useHookstate({
    loading: false,
    errorMessage: ''
  })

  const showAssetOnlyProjects = useHookstate<boolean>(false)
  const errorMessage = state.errorMessage.value.includes('project_setting_projectid_key_unique')
    ? t('admin:components.setting.project.duplicateKey')
    : state.errorMessage.value
  const projects = useFind(projectPath, {
    query: {
      action: 'admin',
      assetsOnly: showAssetOnlyProjects.value,
      allowed: true
    }
  })

  const displayedSettings = useHookstate<ProjectSettingType[]>([])
  const originalSettings = useHookstate<ProjectSettingType[]>([])
  const selectedProjectId = useHookstate(projects.data.length > 0 ? projects.data[0].id : '')

  const project = useGet(projectPath, selectedProjectId.value, { query: { $select: ['settings'] } })

  const {
    create: createProjectSetting,
    patch: patchProjectSetting,
    remove: removeProjectSetting
  } = useMutation(projectSettingPath)

  useEffect(() => {
    if (project.data && project.data.settings) {
      originalSettings.set(JSON.parse(JSON.stringify(project.data.settings)))
      displayedSettings.set(originalSettings.value.slice())
    }
  }, [project])

  const projectsMenu = projects.data.map((el) => {
    return {
      label: el.name,
      value: el.id
    }
  })

  const handleSettingsVisibilityChange = (setting: ProjectSettingType, index: number) => {
    displayedSettings[index].set({
      ...setting,
      type: displayedSettings[index].value.type === 'private' ? 'public' : 'private'
    })
  }

  const handleSettingsKeyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setting: ProjectSettingType,
    index: number
  ) => {
    displayedSettings[index].set({ ...setting, key: e.target.value })
  }

  const handleSettingsValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setting: ProjectSettingType,
    index: number
  ) => {
    displayedSettings[index].set({ ...setting, value: e.target.value })
  }

  const handleSaveSetting = async (setting: ProjectSettingType) => {
    try {
      state.loading.set(true)
      await patchProjectSetting(
        setting.id,
        {
          key: setting.key,
          value: setting.value,
          type: setting.type
        },
        {
          query: {
            projectId: selectedProjectId.value
          }
        }
      )
      state.set({ loading: false, errorMessage: '' })
      project.refetch()
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
    }
  }

  const handleAddSetting = async () => {
    try {
      state.loading.set(true)
      await createProjectSetting({
        projectId: selectedProjectId.value,
        key: '',
        value: '',
        type: 'private'
      })
      state.set({ loading: false, errorMessage: '' })
      project.refetch()
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
    }
  }

  const handleRemoveSetting = async (setting: ProjectSettingType) => {
    try {
      state.loading.set(true)
      await removeProjectSetting(setting.id, {
        query: {
          projectId: selectedProjectId.value
        }
      })
      state.set({ loading: false, errorMessage: '' })
      project.refetch()
    } catch (err) {
      state.set({ loading: false, errorMessage: err.message })
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
      <Toggle
        className="mt-2"
        label={t('admin:components.setting.project.showAssetOnly')}
        value={showAssetOnlyProjects.value}
        onChange={showAssetOnlyProjects.set}
      />

      <Select
        options={projectsMenu}
        currentValue={selectedProjectId.value}
        onChange={(value) => selectedProjectId.set(value)}
        label={t('admin:components.setting.project.header')}
        className="mb-8 mt-6 max-w-[50%]"
      />

      {selectedProjectId.value && (
        <>
          {displayedSettings.value.map((setting: ProjectSettingType, index: number) => (
            <div className="my-2 flex flex-row items-end gap-2" key={index}>
              <Input
                labelProps={{
                  text: t('admin:components.setting.project.keyName'),
                  position: 'top'
                }}
                value={setting.key}
                endComponent={
                  <Button
                    className="text-primary mr-1 rounded py-1"
                    variant={setting.type === 'private' ? 'danger' : 'success'}
                    size="small"
                    onClick={() => handleSettingsVisibilityChange(setting, index)}
                  >
                    {setting.type}
                  </Button>
                }
                onChange={(e) => handleSettingsKeyChange(e, setting, index)}
              />
              <Input
                labelProps={{
                  text: t('admin:components.setting.project.value'),
                  position: 'top'
                }}
                value={setting.value || ''}
                endComponent={
                  setting.userId && (
                    <Tooltip
                      position="left center"
                      content={t('admin:components.common.lastUpdatedBy', {
                        userId: setting.userId,
                        updatedAt: toDisplayDateTime(setting.updatedAt)
                      })}
                    >
                      <HiUser className="mr-2" />
                    </Tooltip>
                  )
                }
                onChange={(e) => handleSettingsValueChange(e, setting, index)}
              />
              <Button
                className="text-primary mb-[2px] ml-1 rounded"
                variant="outline"
                size="small"
                title={t('admin:components.common.save')}
                onClick={() => handleSaveSetting(setting)}
              >
                {t('admin:components.common.save')}
              </Button>
              <Button
                className="mb-1 px-0"
                rounded="full"
                variant="transparent"
                title={t('admin:components.common.delete')}
                onClick={() => handleRemoveSetting(setting)}
                startIcon={<HiTrash className="place-self-center text-theme-iconRed" />}
              />
            </div>
          ))}
          <Button
            onClick={handleAddSetting}
            startIcon={state.loading.value && <LoadingView spinnerOnly className="h-8 w-8" />}
          >
            {t('admin:components.setting.project.add')}
          </Button>
        </>
      )}

      {errorMessage && (
        <Text component="h3" className="text-red-700">
          {errorMessage}
        </Text>
      )}
    </Accordion>
  )
})

export default ProjectTab
