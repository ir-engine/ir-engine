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

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useMutation } from '@ir-engine/common'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Vector3 } from 'three'
import ImageCompressionPanel from '../../components/assets/ImageCompressionPanel'
import ModelCompressionPanel from '../../components/assets/ModelCompressionPanel'
import { FileDataType } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { FilesState, SelectedFilesState } from '../../services/FilesState'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { fileConsistsOfContentType, useCurrentFiles } from './helpers'
import DeleteFileModal from './modals/DeleteFileModal'
import FilePropertiesModal from './modals/FilePropertiesModal'
import RenameFileModal from './modals/RenameFileModal'

function PasteFileButton({
  newPath,
  setAnchorEvent
}: {
  newPath?: string
  setAnchorEvent: (event: React.MouseEvent | undefined) => void
}) {
  const { t } = useTranslation()
  const { filesQuery } = useCurrentFiles()
  const isFilesLoading = filesQuery?.status === 'pending'
  const filesState = useMutableState(FilesState)
  const fileService = useMutation(fileBrowserPath)
  const file = filesState.clipboardFile.value?.file
  const currentDirectory = filesState.selectedDirectory.value.startsWith('/')
    ? filesState.selectedDirectory.value.substring(1)
    : filesState.selectedDirectory.value

  return (
    <Button
      variant="outline"
      size="small"
      fullWidth
      disabled={!file}
      onClick={() => {
        if (!file || isFilesLoading) return
        setAnchorEvent(undefined)
        fileService.update(null, {
          oldProject: filesState.projectName.value,
          newProject: filesState.projectName.value,
          oldName: file.fullName,
          newName: file.fullName,
          oldPath: file.path,
          newPath: (newPath ?? currentDirectory) + file.fullName,
          isCopy: filesState.clipboardFile.value?.isCopy
        })
      }}
    >
      {t('editor:layout.filebrowser.pasteAsset')}
    </Button>
  )
}

export function FileContextMenu({
  anchorEvent,
  setAnchorEvent,
  file
}: {
  anchorEvent: React.MouseEvent | undefined
  setAnchorEvent: (event: React.MouseEvent | undefined) => void
  file: FileDataType
}) {
  const { t } = useTranslation()
  const { createNewFolder, refreshDirectory } = useCurrentFiles()
  const selectedFiles = useMutableState(SelectedFilesState)
  const filesState = useMutableState(FilesState)

  return (
    <ContextMenu anchorEvent={anchorEvent} onClose={() => setAnchorEvent(undefined)}>
      <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
        <Button variant="outline" size="small" fullWidth onClick={createNewFolder}>
          {t('editor:layout.filebrowser.addNewFolder')}
        </Button>
        {!file.isFolder && (
          <Button
            variant="outline"
            size="small"
            fullWidth
            onClick={() => {
              const vec3 = new Vector3()
              getSpawnPositionAtCenter(vec3)
              addMediaNode(file.url, undefined, undefined, [
                { name: TransformComponent.jsonID, props: { position: vec3 } }
              ])
              setAnchorEvent(undefined)
            }}
          >
            {t('editor:layout.assetGrid.placeObject')}
          </Button>
        )}
        {!file.isFolder && (
          <Button
            variant="outline"
            size="small"
            fullWidth
            onClick={() => {
              addMediaNode(file.url)
              setAnchorEvent(undefined)
            }}
          >
            {t('editor:layout.assetGrid.placeObjectAtOrigin')}
          </Button>
        )}
        {!file.isFolder && (
          <Button
            variant="outline"
            size="small"
            fullWidth
            onClick={() => {
              window.open(file.url)
              setAnchorEvent(undefined)
            }}
          >
            {t('editor:layout.assetGrid.openInNewTab')}
          </Button>
        )}
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(file.url)
            }
            setAnchorEvent(undefined)
          }}
        >
          {t('editor:layout.assetGrid.copyURL')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => {
            filesState.clipboardFile.set({
              file
            })
            setAnchorEvent(undefined)
          }}
        >
          {t('editor:layout.filebrowser.cutAsset')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => {
            filesState.clipboardFile.set({
              file,
              isCopy: true
            })
            setAnchorEvent(undefined)
          }}
        >
          {t('editor:layout.filebrowser.copyAsset')}
        </Button>
        <PasteFileButton newPath={file.isFolder ? file.key : undefined} setAnchorEvent={setAnchorEvent} />
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => {
            PopoverState.showPopupover(<RenameFileModal projectName={filesState.projectName.value} file={file} />)
            setAnchorEvent(undefined)
          }}
        >
          {t('editor:layout.filebrowser.renameAsset')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => {
            PopoverState.showPopupover(
              <DeleteFileModal
                files={selectedFiles.value}
                onComplete={(err) => {
                  selectedFiles.set([])
                  ClickPlacementState.resetSelectedAsset()
                }}
              />
            )
          }}
        >
          {t('editor:layout.assetGrid.deleteAsset')}
        </Button>
        <Button
          variant="outline"
          size="small"
          fullWidth
          onClick={() => {
            if (!selectedFiles.get(NO_PROXY).some((selectedFile) => selectedFile.key === file.key)) {
              if (selectedFiles.value.length > 1) {
                selectedFiles.merge([file])
              } else {
                selectedFiles.set([file])
              }
            }
            PopoverState.showPopupover(<FilePropertiesModal />)
            setAnchorEvent(undefined)
          }}
        >
          {t('editor:layout.filebrowser.viewAssetProperties')}
        </Button>

        {/*
          <Button
            variant="outline"
            size="small"
            fullWidth
            disabled={!fileConsistsOfContentType(item, 'model') && !fileConsistsOfContentType(item, 'image')}
            onClick={() => {
              if (fileConsistsOfContentType(item, 'model')) {
                PopoverState.showPopupover(
                  <ModelCompressionPanel selectedFile={item as FileType} refreshDirectory={refreshDirectory} />
                )
              } else if (fileConsistsOfContentType(item, 'image')) {
                PopoverState.showPopupover(
                  <ImageCompressionPanel selectedFile={item as FileType} refreshDirectory={refreshDirectory} />
                )
              }
              handleClose()
            }}
          >
            {t('editor:layout.filebrowser.compress')}
          </Button>
          */}

        {fileConsistsOfContentType(selectedFiles.value, 'model') && (
          <Button
            variant="outline"
            size="small"
            fullWidth
            disabled={!fileConsistsOfContentType(selectedFiles.value, 'model')}
            onClick={() => {
              if (fileConsistsOfContentType(selectedFiles.value, 'model')) {
                PopoverState.showPopupover(
                  <ModelCompressionPanel selectedFiles={selectedFiles.value} refreshDirectory={refreshDirectory} />
                )
              }
              setAnchorEvent(undefined)
            }}
          >
            {t('editor:layout.filebrowser.compress')}
          </Button>
        )}
        {fileConsistsOfContentType(selectedFiles.value, 'image') && (
          <Button
            variant="outline"
            size="small"
            fullWidth
            disabled={!fileConsistsOfContentType(selectedFiles.value, 'image')}
            onClick={() => {
              if (fileConsistsOfContentType(selectedFiles.value, 'image')) {
                PopoverState.showPopupover(
                  <ImageCompressionPanel selectedFiles={selectedFiles.value} refreshDirectory={refreshDirectory} />
                )
              }
              setAnchorEvent(undefined)
            }}
          >
            {t('editor:layout.filebrowser.compress')}
          </Button>
        )}
      </div>
    </ContextMenu>
  )
}

export function BrowserContextMenu({
  anchorEvent,
  setAnchorEvent
}: {
  anchorEvent: React.MouseEvent | undefined
  setAnchorEvent: (event: React.MouseEvent | undefined) => void
}) {
  const { t } = useTranslation()
  const { createNewFolder } = useCurrentFiles()

  return (
    <ContextMenu anchorEvent={anchorEvent} onClose={() => setAnchorEvent(undefined)}>
      <Button variant="outline" size="small" fullWidth onClick={createNewFolder}>
        {t('editor:layout.filebrowser.addNewFolder')}
      </Button>
      <PasteFileButton setAnchorEvent={setAnchorEvent} />
    </ContextMenu>
  )
}
