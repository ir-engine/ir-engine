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
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { Checkbox, Input, Tooltip } from '@ir-engine/ui'
import { Slider, StudioButton } from '@ir-engine/ui/editor'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import {
  ArrowLeftSm,
  CogSm,
  Download01Sm,
  FolderSm,
  Grid01Sm,
  PlusCircleSm,
  Refresh1Sm,
  SearchSmSm
} from '@ir-engine/ui/src/icons'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { FaList } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'
import { handleUploadFiles, inputFileWithAddToScene } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesState, FilesViewModeSettings, FilesViewModeState } from '../../services/FilesState'
import { availableTableColumns, useCurrentFiles } from './helpers'
import { handleDownloadProject } from './loaders'

export const showMultipleFileModal = (projectName: string, directoryPath: string, files: File[]) => {
  const fileNames = files.map((file) => file.name)

  const onSubmit = async () => {
    await handleUploadFiles(projectName, directoryPath, files)
    PopoverState.hidePopupover()
  }

  PopoverState.showPopupover(
    <>
      <Modal title={'test'} className="w-[50vw] max-w-2xl" onSubmit={onSubmit} onClose={PopoverState.hidePopupover}>
        <div className="flex flex-col rounded-lg bg-[#0e0f11] px-5 py-10 text-center">
          Warning: You will overwrite existing files by uploading these. Do you wish to continue? <br />
          {fileNames.length > 0 && `Files: ${fileNames.join(', ')}`}
        </div>
      </Modal>
    </>
  )
}

function BreadcrumbItems() {
  const filesState = useMutableState(FilesState)
  const { changeDirectoryByPath } = useCurrentFiles()

  const handleBreadcrumbDirectoryClick = (targetFolder: string) => {
    const pattern = /([^/]+)/g
    const result = filesState.selectedDirectory.value.match(pattern)
    if (!result) return
    let newPath = '/'
    for (const folder of result) {
      newPath += folder + '/'
      if (folder === targetFolder) {
        break
      }
    }
    changeDirectoryByPath(newPath)
  }

  let breadcrumbDirectoryFiles = filesState.selectedDirectory.value.slice(1, -1).split('/')

  const nestedIndex = breadcrumbDirectoryFiles.indexOf('projects')

  breadcrumbDirectoryFiles = breadcrumbDirectoryFiles.filter((_, idx) => idx >= nestedIndex)

  return (
    <div className="flex h-6 w-96 items-center gap-2 rounded-lg border border-[#42454D] bg-[#141619] px-2">
      <FolderSm className="text-sm text-[#A3A3A3]" />
      {breadcrumbDirectoryFiles.map((file, index, arr) => (
        <Fragment key={index}>
          {index !== 0 && <span className="cursor-default items-center text-sm text-[#A3A3A3]"> {'>'} </span>}
          {index === arr.length - 1 ? (
            <span
              className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3] hover:underline"
              data-testid={'files-panel-breadcrumb-current-directory'}
            >
              {file}
            </span>
          ) : (
            <a
              className="inline-flex cursor-pointer items-center overflow-hidden text-sm text-[#A3A3A3] hover:text-theme-highlight hover:underline focus:text-theme-highlight"
              onClick={() => handleBreadcrumbDirectoryClick(file)}
              data-testid={`files-panel-breadcrumb-nested-level-${index}`}
            >
              <span className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-[#A3A3A3] hover:underline">
                {file}
              </span>
            </a>
          )}
        </Fragment>
      ))}
    </div>
  )
}

const ViewModeSettings = () => {
  const { t } = useTranslation()
  const viewModeSettings = useMutableState(FilesViewModeSettings)
  const filesViewMode = useMutableState(FilesViewModeState).viewMode

  return (
    <Popup
      contentStyle={{ background: '#15171b', border: 'solid', borderColor: '#5d646c' }}
      position={'bottom left'}
      trigger={
        <Tooltip content={t('editor:layout.filebrowser.view-mode.settings.name')}>
          <StudioButton size="sm" variant="tertiary" data-testid="files-panel-view-options-button">
            <CogSm />
          </StudioButton>
        </Tooltip>
      }
    >
      {filesViewMode.value === 'icons' ? (
        <div className="flex justify-end">
          <div className="w-3/5">
            <Slider
              label={t('editor:layout.filebrowser.view-mode.settings.iconSize')}
              min={10}
              max={100}
              step={0.5}
              value={viewModeSettings.icons.iconSize.value}
              onChange={viewModeSettings.icons.iconSize.set}
              onRelease={viewModeSettings.icons.iconSize.set}
              data-testid="files-panel-view-options-icon-size-value-input-group"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex justify-end">
            <div className="w-3/5">
              <Slider
                label={t('editor:layout.filebrowser.view-mode.settings.fontSize')}
                data-testid="files-panel-view-options-list-font-size-value-input-group"
                min={10}
                max={100}
                step={0.5}
                value={viewModeSettings.list.fontSize.value}
                onChange={viewModeSettings.list.fontSize.set}
                onRelease={viewModeSettings.list.fontSize.set}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="mt-1 flex flex-auto text-white">
              <label>{t('editor:layout.filebrowser.view-mode.settings.select-listColumns')}</label>
            </div>
            <div>
              {availableTableColumns.map((column, index) => (
                <Checkbox
                  checked={viewModeSettings.list.selectedTableColumns[column].value}
                  onChange={(value) => viewModeSettings.list.selectedTableColumns[column].set(value)}
                  label={t(`editor:layout.filebrowser.table-list.headers.${column}`)}
                  data-testid={`files-panel-view-mode-list-options-column-${column}`}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Popup>
  )
}

export default function FilesToolbar() {
  const { t } = useTranslation()
  const filesState = useMutableState(FilesState)

  const originalPath = useMutableState(EditorState).projectName.value
  const filesViewMode = useMutableState(FilesViewModeState).viewMode

  const showBackButton = filesState.selectedDirectory.value.split('/').length > (originalPath?.split('/').length || 0)
  const showDownloadButtons = filesState.selectedDirectory.value.startsWith(
    '/projects/' + filesState.projectName.value + '/'
  )
  const showUploadButtons =
    filesState.selectedDirectory.value.startsWith('/projects/' + filesState.projectName.value + '/public/') ||
    filesState.selectedDirectory.value.startsWith('/projects/' + filesState.projectName.value + '/assets/')

  const { backDirectory, refreshDirectory, createNewFolder } = useCurrentFiles()

  return (
    <>
      <div className="mb-1 flex h-8 items-center gap-2 bg-[#191B1F] py-1">
        <div className="ml-2" />
        {showBackButton && (
          <div>
            <Tooltip content={t('editor:layout.filebrowser.back')}>
              <StudioButton
                size="sm"
                variant="tertiary"
                data-testid="files-panel-back-directory-button"
                onClick={backDirectory}
                rounded
              >
                <ArrowLeftSm />
              </StudioButton>
            </Tooltip>
          </div>
        )}

        <div>
          <Tooltip content={t('editor:layout.filebrowser.refresh')}>
            <StudioButton
              size="sm"
              variant="tertiary"
              data-testid="files-panel-refresh-directory-button"
              onClick={refreshDirectory}
            >
              <Refresh1Sm />
            </StudioButton>
          </Tooltip>
        </div>

        <ViewModeSettings />
        <div className="ml-10 flex h-7 items-center gap-2 rounded bg-[#2F3137] p-2">
          <FaList
            className={twMerge(
              'h-5 w-5 cursor-pointer text-[#9CA0AA]',
              filesViewMode.value === 'list' && 'cursor-auto text-[#F5F5F5]'
            )}
            onClick={() => filesViewMode.set('list')}
          />
          <Grid01Sm
            className={twMerge(
              'h-5 w-5 cursor-pointer text-[#9CA0AA]',
              filesViewMode.value === 'icons' && 'cursor-auto text-[#F5F5F5]'
            )}
            onClick={() => filesViewMode.set('icons')}
          />
        </div>

        <div className="align-center flex h-6 w-full justify-center gap-2 sm:px-2 md:px-4 lg:px-6 xl:px-10">
          <BreadcrumbItems />
          <Input
            placeholder={t('editor:layout.filebrowser.search-placeholder')}
            value={filesState.searchText.value}
            onChange={(e) => {
              filesState.searchText.set(e.target.value)
            }}
            height="xs"
            startComponent={<SearchSmSm className="h-[14px] w-[14px] text-[#9CA0AA]" />}
            data-testid="files-panel-search-input"
          />
        </div>

        <div id="downloadProject">
          <Tooltip
            content={
              showDownloadButtons
                ? t('editor:layout.filebrowser.downloadProject')
                : t('editor:layout.filebrowser.downloadProjectUnavailable')
            }
          >
            <StudioButton
              size="sm"
              variant="tertiary"
              onClick={() => handleDownloadProject(filesState.projectName.value, filesState.selectedDirectory.value)}
              data-testid="files-panel-download-project-button"
            >
              <Download01Sm />
            </StudioButton>
          </Tooltip>
        </div>

        <div className="w-fit">
          <StudioButton
            size="l"
            variant="tertiary"
            disabled={!showUploadButtons}
            onClick={() =>
              inputFileWithAddToScene({
                projectName: filesState.projectName.value,
                directoryPath: filesState.selectedDirectory.get(NO_PROXY).slice(1)
              })
                .then(() => refreshDirectory())
                .catch((err) => {
                  NotificationService.dispatchNotify(err.message, { variant: 'error' })
                })
            }
            data-testid="files-panel-upload-files-button"
            className="disabled:bg-[#212226]"
          >
            <FolderSm />
            <span className="text-nowrap">{t('editor:layout.filebrowser.uploadFiles')}</span>
          </StudioButton>
        </div>
        <div className="w-fit">
          <StudioButton
            size="l"
            disabled={!showUploadButtons}
            variant="tertiary"
            className="disabled:bg-[#212226]"
            onClick={() =>
              inputFileWithAddToScene({
                projectName: filesState.projectName.value,
                directoryPath: filesState.selectedDirectory.get(NO_PROXY).slice(1),
                preserveDirectory: true
              })
                .then(refreshDirectory)
                .catch((err) => {
                  NotificationService.dispatchNotify(err.message, { variant: 'error' })
                })
            }
            data-testid="files-panel-upload-folder-button"
          >
            <PlusCircleSm />
            <span className="text-nowrap">{t('editor:layout.filebrowser.uploadFolder')}</span>
          </StudioButton>
        </div>
      </div>
    </>
  )
}
