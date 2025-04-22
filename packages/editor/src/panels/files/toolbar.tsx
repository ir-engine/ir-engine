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
import { REMOVE_EDGE_SLASH_REGEX } from '@ir-engine/common/src/regex'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { Button, Checkbox, Input, Tooltip } from '@ir-engine/ui'
import { Slider, ViewportButton } from '@ir-engine/ui/editor'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import {
  ArrowLeftSm,
  CogSm,
  Download01Sm,
  FolderPlusSm,
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
import {
  handleConvertGifFileToVideoAndUpload,
  handleUploadFiles,
  inputFileWithAddToScene
} from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesState, FilesViewModeSettings, FilesViewModeState } from '../../services/FilesState'
import { availableTableColumns, useCurrentFiles } from './helpers'
import { handleDownloadProject } from './loaders'

// keeping this here for now, Move this to icons or static folder
export function BreadCrumbSlash() {
  return (
    <svg width="20" height="20" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="Breadcrumb">
        <path
          id="Icon"
          d="M4.38843 12.4435L9.98843 1.24347L10.6142 1.55707L5.01423 12.7571L4.38843 12.4435Z"
          fill="#B2B5BD"
        />
      </g>
    </svg>
  )
}

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
export const showGifFileConfimation = (projectName: string, directoryPath: string, files: File[]) => {
  const fileNames = files.map((file) => file.name)

  const onSubmit = async () => {
    await handleConvertGifFileToVideoAndUpload(projectName, directoryPath, files)
    PopoverState.hidePopupover()
  }

  PopoverState.showPopupover(
    <>
      <Modal title={'test'} className="w-[50vw] max-w-2xl" onSubmit={onSubmit} onClose={PopoverState.hidePopupover}>
        <div className="flex flex-col rounded-lg bg-[#0e0f11] px-5 py-10 text-center">
          Warning: We don't support animated GIF files, do you want to convert them to Video? <br />
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
  breadcrumbDirectoryFiles = breadcrumbDirectoryFiles.filter((_, idx) => idx > nestedIndex + 1)

  return (
    <div className="flex items-center gap-2">
      <FolderSm className="text-base text-text-primary" />
      {breadcrumbDirectoryFiles.map((file, index, arr) => (
        <Fragment key={index}>
          {index !== 0 && (
            <span className="cursor-default items-center text-base text-text-primary">
              <BreadCrumbSlash />
            </span>
          )}
          {index === arr.length - 1 ? (
            <span
              className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-base text-text-secondary hover:underline"
              data-testid={'files-panel-breadcrumb-current-directory'}
            >
              {file}
            </span>
          ) : (
            <a
              className="hover: focus: inline-flex cursor-pointer items-center overflow-hidden text-sm text-text-secondary hover:underline"
              onClick={() => handleBreadcrumbDirectoryClick(file)}
              data-testid={`files-panel-breadcrumb-nested-level-${index}`}
            >
              <span className="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-base text-text-secondary hover:underline">
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
      contentStyle={{
        background: 'var(--surface-1)',
        border: 'solid',
        borderColor: 'var(--ui-outline)',
        borderWidth: '2px',
        borderRadius: '0.5rem'
      }}
      position={'bottom left'}
      trigger={
        <Tooltip content={t('editor:layout.filebrowser.view-mode.settings.name')}>
          <ViewportButton data-testid="files-panel-view-options-button" icon={CogSm} />
        </Tooltip>
      }
    >
      {filesViewMode.value === 'icons' ? (
        <div className="flex justify-end">
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
      ) : (
        <div className="flex flex-col items-center gap-y-1">
          <div className="flex justify-end">
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
          <div className="flex w-full flex-col gap-y-1">
            <div className="mt-1 flex flex-auto font-semibold text-text-primary">
              <h3>{t('editor:layout.filebrowser.view-mode.settings.select-listColumns')}</h3>
            </div>
            <div className="flex flex-col gap-y-0.5">
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

  const filesViewMode = useMutableState(FilesViewModeState).viewMode

  const showDownloadButtons = filesState.selectedDirectory.value.startsWith(
    '/projects/' + filesState.projectName.value + '/'
  )
  const showUploadButtons =
    filesState.selectedDirectory.value.startsWith('/projects/' + filesState.projectName.value + '/public/') ||
    filesState.selectedDirectory.value.startsWith('/projects/' + filesState.projectName.value + '/assets/')

  const { backDirectory, refreshDirectory } = useCurrentFiles()

  return (
    <PanelToolbar
      onBackDirectory={backDirectory}
      onRefreshDirectory={refreshDirectory}
      breadcrumbComponent={<BreadcrumbItems />}
      searchbar={
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
      }
      dataTestIdJson={{}}
      utilsComponent={
        <>
          <Tooltip
            content={
              showDownloadButtons
                ? t('editor:layout.filebrowser.downloadProject')
                : t('editor:layout.filebrowser.downloadProjectUnavailable')
            }
          >
            <ViewportButton
              onClick={() => handleDownloadProject(filesState.projectName.value, filesState.selectedDirectory.value)}
              data-testid="files-panel-download-project-button"
              icon={Download01Sm}
              id="downloadProject"
            />
          </Tooltip>
          <div className="flex h-7 items-center gap-2 rounded p-2">
            <button className="p-1 text-text-secondary hover:text-text-primary">
              <FaList
                className={twMerge('h-5 w-5', filesViewMode.value === 'list' ? 'cursor-auto text-ui-primary' : '')}
                onClick={() => filesViewMode.set('list')}
              />
            </button>
            <button className="p-1 text-text-secondary hover:text-text-primary">
              <Grid01Sm
                className={twMerge('h-5 w-5', filesViewMode.value === 'icons' ? 'cursor-auto text-ui-primary' : '')}
                onClick={() => filesViewMode.set('icons')}
              />
            </button>
          </div>
        </>
      }
      uploadButton={
        <>
          <Button
            size="l"
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
            <PlusCircleSm />
            <span className="text-nowrap">{t('editor:layout.filebrowser.uploadFiles')}</span>
          </Button>
          <Button
            size="l"
            disabled={!showUploadButtons}
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
            <FolderSm />
            <span className="text-nowrap">{t('editor:layout.filebrowser.uploadFolder')}</span>
          </Button>
        </>
      }
    />
  )
}

export function PanelToolbar({
  onBackDirectory,
  onRefreshDirectory,
  breadcrumbComponent,
  searchbar,
  dataTestIdJson,
  uploadButton,
  utilsComponent
}: {
  onBackDirectory: () => void
  onRefreshDirectory: () => void
  breadcrumbComponent?: React.ReactNode
  searchbar?: React.ReactNode
  dataTestIdJson?: Record<string, string>
  uploadButton?: React.ReactNode
  utilsComponent?: React.ReactNode
}) {
  const { t } = useTranslation()
  const { createNewFolder } = useCurrentFiles()
  const filesState = useMutableState(FilesState)
  const originalPath = useMutableState(EditorState).projectName.value
  const showBackButton =
    filesState.selectedDirectory.value.replace(REMOVE_EDGE_SLASH_REGEX, '').split('/').length >
    (originalPath?.split('/').length || 0) + 1

  return (
    <div
      className="mb-1 flex items-center justify-between gap-2 bg-[#1E1F22] bg-surface-4 px-2 py-1"
      data-testid={dataTestIdJson?.topbarId}
    >
      {/* Tools */}
      <div className="flex items-center gap-x-1 divide-x divide-ui-outline">
        <div className="flex items-center">
          {showBackButton && (
            <div>
              <Tooltip content={t('editor:layout.filebrowser.back')}>
                <ViewportButton
                  data-testid={dataTestIdJson?.backButtonId}
                  onClick={onBackDirectory}
                  icon={ArrowLeftSm}
                />
              </Tooltip>
            </div>
          )}
          <div>
            <Tooltip content={t('editor:layout.filebrowser.refresh')}>
              <ViewportButton
                data-testid={dataTestIdJson?.refreshButtonId}
                onClick={onRefreshDirectory}
                icon={Refresh1Sm}
              />
            </Tooltip>
          </div>
          <Tooltip content={t('editor:layout.filebrowser.addNewFolder')}>
            <ViewportButton onClick={createNewFolder} icon={FolderPlusSm} />
          </Tooltip>
          <ViewModeSettings />
        </div>
        {utilsComponent && <div className="flex items-center">{utilsComponent}</div>}
        <div className="flex items-center gap-x-2 px-1">{uploadButton}</div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">{breadcrumbComponent}</div>

      {/* Search */}
      <div>{searchbar}</div>
    </div>
  )
}
