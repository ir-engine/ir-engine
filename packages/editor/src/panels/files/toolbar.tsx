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
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { Slider } from '@ir-engine/ui/editor'
import BooleanInput from '@ir-engine/ui/src/components/editor/input/Boolean'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Input from '@ir-engine/ui/src/primitives/tailwind/Input'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { FaList } from 'react-icons/fa'
import { FiDownload, FiGrid, FiRefreshCcw } from 'react-icons/fi'
import { HiOutlineFolder, HiOutlinePlusCircle } from 'react-icons/hi'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { IoArrowBack, IoSettingsSharp } from 'react-icons/io5'
import { PiFolderPlusBold } from 'react-icons/pi'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesState, FilesViewModeSettings, FilesViewModeState } from '../../services/FilesState'
import { availableTableColumns, useCurrentFiles } from './helpers'
import { handleDownloadProject } from './loaders'

const VIEW_MODES = [
  { mode: 'list', icon: <FaList /> },
  { mode: 'icons', icon: <FiGrid /> }
]

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
      <HiOutlineFolder className="text-sm text-[#A3A3A3]" />
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
          <Button
            startIcon={<IoSettingsSharp />}
            className="h-7 w-7 rounded-lg bg-transparent p-0"
            data-testid="files-panel-view-options-button"
          />
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
                <InputGroup
                  label={t(`editor:layout.filebrowser.table-list.headers.${column}`)}
                  dataTestId={`files-panel-view-mode-list-options-column-${column}`}
                  key={index}
                >
                  <BooleanInput
                    value={viewModeSettings.list.selectedTableColumns[column].value}
                    onChange={(value) => viewModeSettings.list.selectedTableColumns[column].set(value)}
                  />
                </InputGroup>
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
      <div className="mb-1 flex h-8 items-center gap-2 bg-[#212226] py-1">
        <div className="ml-2" />
        {showBackButton && (
          <div id="backDir" className="pointer-events-auto flex h-7 w-7 items-center rounded-lg">
            <Tooltip content={t('editor:layout.filebrowser.back')} className="left-1">
              <Button
                variant="transparent"
                startIcon={<IoArrowBack />}
                className={`p-0`}
                data-testid="files-panel-back-directory-button"
                onClick={backDirectory}
              />
            </Tooltip>
          </div>
        )}

        <div id="refreshDir" className="flex h-7 w-7 items-center rounded-lg">
          <Tooltip content={t('editor:layout.filebrowser.refresh')}>
            <Button
              variant="transparent"
              startIcon={<FiRefreshCcw />}
              className="p-0"
              data-testid="files-panel-refresh-directory-button"
              onClick={refreshDirectory}
            />
          </Tooltip>
        </div>

        <ViewModeSettings />

        <div className="w-30 flex h-7 flex-row items-center gap-1 rounded bg-[#2F3137] px-1 py-1 ">
          {VIEW_MODES.map(({ mode, icon }) => (
            <Button
              key={mode}
              variant="transparent"
              startIcon={icon}
              className={`p-0 ${filesViewMode.value !== mode ? 'opacity-50' : ''}`}
              onClick={() => filesViewMode.set(mode as 'icons' | 'list')}
              data-testid={`files-panel-view-mode-${mode}-button`}
            />
          ))}
        </div>

        <div className="align-center flex h-6 w-full justify-center gap-2 sm:px-2 md:px-4 lg:px-6 xl:px-10">
          <BreadcrumbItems />
          <Input
            placeholder={t('editor:layout.filebrowser.search-placeholder')}
            value={filesState.searchText.value}
            onChange={(e) => {
              filesState.searchText.set(e.target.value)
            }}
            labelClassname="text-sm text-red-500"
            containerClassName="flex h-full w-auto rounded-lg overflow-hidden"
            className="h-6 rounded-lg border border-theme-input px-2 py-0 text-xs text-[#A3A3A3] placeholder:text-[#A3A3A3] focus-visible:ring-0"
            startComponent={<HiMagnifyingGlass className="h-[14px] w-[14px] text-[#A3A3A3]" />}
            data-testid="files-panel-search-input"
          />
        </div>

        <div id="downloadProject" className="flex h-7 w-7 items-center rounded-lg bg-[#2F3137]">
          <Tooltip
            content={
              showDownloadButtons
                ? t('editor:layout.filebrowser.downloadProject')
                : t('editor:layout.filebrowser.downloadProjectUnavailable')
            }
          >
            <Button
              variant="transparent"
              startIcon={<FiDownload />}
              className="p-0"
              onClick={() => handleDownloadProject(filesState.projectName.value, filesState.selectedDirectory.value)}
              disabled={!showDownloadButtons}
              data-testid="files-panel-download-project-button"
            />
          </Tooltip>
        </div>

        <div id="newFolder" className="flex h-7 w-7 items-center rounded-lg bg-[#2F3137]">
          <Tooltip content={t('editor:layout.filebrowser.addNewFolder')}>
            <Button
              variant="transparent"
              startIcon={<PiFolderPlusBold />}
              className="p-0"
              onClick={createNewFolder}
              data-testid="files-panel-create-new-folder-button"
            />
          </Tooltip>
        </div>

        <Button
          startIcon={<HiOutlinePlusCircle />}
          disabled={!showUploadButtons}
          rounded="none"
          className="h-full whitespace-nowrap bg-theme-highlight px-2"
          size="small"
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
        >
          {t('editor:layout.filebrowser.uploadFiles')}
        </Button>
        <Button
          startIcon={<HiOutlinePlusCircle />}
          disabled={!showUploadButtons}
          rounded="none"
          className="h-full whitespace-nowrap bg-theme-highlight px-2"
          size="small"
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
          {t('editor:layout.filebrowser.uploadFolder')}
        </Button>
      </div>
    </>
  )
}
