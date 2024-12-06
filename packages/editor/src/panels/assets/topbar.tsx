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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { Button, Tooltip } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import { ArrowLeftSm, CogSm, FolderSm, PlusCircleSm, Refresh1Sm, SearchSmSm } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { validateImportFolderPath } from '../../components/dialogs/ImportSettingsPanelDialog'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesViewModeSettings } from '../../services/FilesState'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import { useAssetsCategory, useAssetsQuery } from './hooks'

const ViewModeSettings = () => {
  const { t } = useTranslation()
  const viewModeSettings = useMutableState(FilesViewModeSettings)

  return (
    <Popup
      contentStyle={{ background: '#15171b', border: 'solid', borderColor: '#5d646c' }}
      position={'bottom left'}
      trigger={
        <Tooltip content={t('editor:layout.filebrowser.view-mode.settings.name')}>
          <Button size="sm" variant="secondary" data-testid="assets-panel-view-options-button">
            <CogSm />
          </Button>
        </Tooltip>
      }
    >
      <div className="flex flex-col justify-end">
        <div className="w-3/5">
          <Slider
            label={t('editor:layout.filebrowser.view-mode.settings.fontSize')}
            min={10}
            max={100}
            step={0.5}
            value={viewModeSettings.list.fontSize.value}
            onChange={viewModeSettings.list.fontSize.set}
            onRelease={viewModeSettings.list.fontSize.set}
          />
        </div>
      </div>
    </Popup>
  )
}

export const uploadFiles = () => {
  const projectName = getState(EditorState).projectName
  const importFolder = getState(ImportSettingsState).importFolder

  try {
    validateImportFolderPath(importFolder)
  } catch (e) {
    NotificationService.dispatchNotify(e.message, { variant: 'error' })
  }

  return inputFileWithAddToScene({
    projectName: projectName as string,
    directoryPath: `projects/${projectName}${importFolder}`
  }).catch((err) => {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  })
}

export function AssetsBreadcrumbs() {
  const { currentCategoryPath } = useAssetsCategory()
  const { refetchResources } = useAssetsQuery()
  const parentCategories = currentCategoryPath.length > 1 ? currentCategoryPath.slice(0, -1) : []
  const currentCategory = currentCategoryPath.length > 0 ? currentCategoryPath.at(-1) : null

  const handleSelectParentCategory = (index: number) => {
    currentCategoryPath.set((prevPath) => prevPath.slice(0, index + 1))
    refetchResources()
  }

  return (
    <div
      className="flex h-6 w-96 items-center gap-2 rounded-lg border border-[#42454D] bg-[#141619] px-2"
      data-testid="assets-panel-breadcrumbs"
    >
      <FolderSm onClick={() => handleSelectParentCategory(0)} className="cursor-pointer text-xs text-[#42454D]" />
      {parentCategories.map((category, idx) => (
        <span
          key={category.name.value}
          className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3]"
          data-testid={`assets-panel-breadcrumb-nested-level-${idx}`}
          onClick={() => handleSelectParentCategory(idx)}
        >
          <span className="hover:underline">{category.name.value}</span>
          <span>{' > '}</span>
        </span>
      ))}
      {currentCategory && (
        <span
          className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3]"
          data-testid="assets-panel-breadcrumb-current-category"
        >
          {currentCategory.name.value}
        </span>
      )}
    </div>
  )
}

export default function Topbar() {
  const { t } = useTranslation()
  const { search } = useAssetsQuery()
  const { currentCategoryPath, expandedCategories } = useAssetsCategory()
  const { refetchResources, staticResourcesPagination } = useAssetsQuery()

  const handleBack = () => {
    currentCategoryPath.set((path) => path.slice(0, -1))
    refetchResources()
  }

  const handleRefresh = () => {
    expandedCategories.set({})
    refetchResources()
  }

  useEffect(() => {
    staticResourcesPagination.skip.set(0)
    refetchResources()
  }, [search.query])

  return (
    <div className="mb-1 flex h-8 items-center gap-2 bg-[#191B1F] py-1" data-testid="assets-panel-top-bar">
      <div className="ml-2" />
      <div>
        <Tooltip content={t('editor:layout.filebrowser.back')}>
          <Button size="sm" variant="secondary" data-testid="assets-panel-back-button" onClick={handleBack}>
            <ArrowLeftSm />
          </Button>
        </Tooltip>
      </div>
      <div>
        <Tooltip content={t('editor:layout.filebrowser.refresh')}>
          <Button size="sm" variant="secondary" data-testid="assets-panel-refresh-button" onClick={handleRefresh}>
            <Refresh1Sm />
          </Button>
        </Tooltip>
      </div>
      <ViewModeSettings />
      <div className="align-center flex h-6 w-full justify-center gap-2 sm:px-2 md:px-4 lg:px-6 xl:px-10">
        <AssetsBreadcrumbs />
        <SearchBar
          inputProps={{
            placeholder: t('editor:layout.scene-assets.search-placeholder'),
            height: 'xs',
            startComponent: <SearchSmSm className="h-3.5 w-3.5 text-[#A3A3A3]" />
          }}
          search={search}
        />
      </div>
      <div className="w-fit">
        <Button
          size="l"
          variant="secondary"
          data-testid="assets-panel-upload-button"
          className="bg-[#212226]"
          onClick={() => uploadFiles().then(handleRefresh)}
        >
          <PlusCircleSm />
          <span className="text-nowrap">{t('editor:layout.filebrowser.uploadAssets')}</span>
        </Button>
      </div>
    </div>
  )
}
