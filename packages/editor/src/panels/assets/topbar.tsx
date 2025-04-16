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
import { ViewportButton } from '@ir-engine/ui/editor'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import { Download01Sm, FolderSm, PlusCircleSm, SearchSmSm } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { validateImportFolderPath } from '../../components/dialogs/ImportSettingsPanelDialog'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesState } from '../../services/FilesState'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import { handleDownloadProject } from '../files/loaders'
import { BreadCrumbSlash, PanelToolbar } from '../files/toolbar'
import { AssetCategoryNode } from './categories'
import { findCategoryByPath } from './helpers'
import { assetCategories, useAssetsCategory, useAssetsQuery } from './hooks'

export const uploadFiles = (): Promise<null> =>
  new Promise((resolve, reject) => {
    const projectName = getState(EditorState).projectName
    const importFolder = getState(ImportSettingsState).importFolder

    try {
      validateImportFolderPath(importFolder)
    } catch (e) {
      NotificationService.dispatchNotify(e.message, { variant: 'error' })
      reject(e)
    }

    inputFileWithAddToScene({
      projectName: projectName as string,
      directoryPath: `projects/${projectName}${importFolder}`
    })
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
        reject(err)
      })
  })

export function AssetsBreadcrumbs() {
  const { currentCategoryPath } = useAssetsCategory()
  const { refetchResources } = useAssetsQuery()
  const currentCategory = currentCategoryPath.get({ noproxy: true }) as AssetCategoryNode

  const breadcrumbTrail = currentCategory?.path
    ? currentCategory.path.split('/').map((name, index, array) => ({
        name,
        path: array.slice(0, index + 1).join('/')
      }))
    : []

  const handleSelectParentCategory = (index: number) => {
    const selectedPath = breadcrumbTrail[index].path
    const newParent = findCategoryByPath(assetCategories as AssetCategoryNode[], selectedPath)
    currentCategoryPath.set(newParent || undefined)
    refetchResources()
  }

  return (
    <div className="flex items-center gap-2" data-testid="assets-panel-breadcrumbs">
      <FolderSm onClick={() => handleSelectParentCategory(0)} className="text-base text-text-secondary" />
      {breadcrumbTrail.map((category, idx) => (
        <div key={category.path} className="flex items-center">
          <span
            className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-base text-text-secondary"
            data-testid={`assets-panel-breadcrumb-nested-level-${idx}`}
            onClick={() => handleSelectParentCategory(idx)}
          >
            {category.name}
          </span>
          {idx < breadcrumbTrail.length - 1 && <BreadCrumbSlash />}
        </div>
      ))}
    </div>
  )
}

export default function Topbar() {
  const { t } = useTranslation()
  const { search } = useAssetsQuery()
  const { currentCategoryPath } = useAssetsCategory()
  const { refetchResources, staticResourcesPagination } = useAssetsQuery()
  const filesState = useMutableState(FilesState)

  const handleBack = () => {
    const path = currentCategoryPath.value?.path.split('/') ?? []
    if (path.length <= 1) {
      currentCategoryPath.set(undefined)
      return
    }
    const selectedPath = path.slice(0, path.length - 1).join('/')
    const foundCategory = findCategoryByPath(assetCategories as AssetCategoryNode[], selectedPath)
    currentCategoryPath.set(foundCategory || undefined)
    refetchResources()
  }

  const handleRefresh = () => {
    refetchResources()
  }

  useEffect(() => {
    staticResourcesPagination.skip.set(0)
    refetchResources()
  }, [search.query])

  return (
    <PanelToolbar
      onBackDirectory={handleBack}
      onRefreshDirectory={handleRefresh}
      breadcrumbComponent={<AssetsBreadcrumbs />}
      searchbar={
        <SearchBar
          inputProps={{
            placeholder: t('editor:layout.scene-assets.search-placeholder'),
            height: 'xs',
            startComponent: <SearchSmSm className="h-5 w-5 text-[#A3A3A3]" />
          }}
          search={search}
        />
      }
      utilsComponent={
        <Tooltip content={t('editor:layout.filebrowser.downloadProject')}>
          <ViewportButton
            onClick={() => handleDownloadProject(filesState.projectName.value, filesState.selectedDirectory.value)}
            data-testid="files-panel-download-project-button"
            icon={Download01Sm}
            id="downloadProject"
          />
        </Tooltip>
      }
      uploadButton={
        <Button size="l" data-testid="assets-panel-upload-button" onClick={() => uploadFiles().then(handleRefresh)}>
          <PlusCircleSm />
          <span className="text-nowrap">{t('editor:layout.filebrowser.uploadAssets')}</span>
        </Button>
      }
      dataTestIdJson={{
        topbarId: 'assets-panel-top-bar',
        backButtonId: 'assets-panel-back-button',
        refreshButtonId: 'assets-panel-refresh-button',
        createNewFolderButtonId: 'assets-panel-create-new-folder-button'
      }}
    />
  )
}
