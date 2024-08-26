import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { useMutation } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Vector3 } from 'three'
import { FileDataType } from '../../components/assets/FileBrowser/FileDataType'
import ImageCompressionPanel from '../../components/assets/ImageCompressionPanel'
import ModelCompressionPanel from '../../components/assets/ModelCompressionPanel'
import { addMediaNode } from '../../functions/addMediaNode'
import { getSpawnPositionAtCenter } from '../../functions/screenSpaceFunctions'
import { FilesState, SelectedFilesState, useCurrentFiles } from '../../services/FilesState'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { fileConsistsOfContentType } from './helpers'
import DeleteFileModal from './modals/DeleteFileModal'
import FilePropertiesModal from './modals/FilePropertiesModal'
import RenameFileModal from './modals/RenameFileModal'

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
  const { onCreateNewFolder, onRefreshDirectory, filesQuery } = useCurrentFiles()
  const isFilesLoading = filesQuery?.status === 'pending'
  const selectedFiles = useMutableState(SelectedFilesState)
  const filesState = useMutableState(FilesState)
  const fileService = useMutation(fileBrowserPath)

  return (
    <ContextMenu anchorEvent={anchorEvent} onClose={() => setAnchorEvent(undefined)}>
      <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 shadow-lg">
        <Button variant="outline" size="small" fullWidth onClick={onCreateNewFolder}>
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
        <Button
          variant="outline"
          size="small"
          fullWidth
          disabled={!filesState.clipboardFile.value}
          onClick={() => {
            if (!filesState.clipboardFile.value || isFilesLoading) return
            setAnchorEvent(undefined)
            fileService.update(null, {
              oldProject: filesState.projectName.value,
              newProject: filesState.projectName.value,
              oldName: filesState.clipboardFile.value.file.fullName,
              newName: filesState.clipboardFile.value.file.fullName,
              oldPath: filesState.clipboardFile.value.file.path,
              newPath: file.isFolder ? file.path + file.fullName : file.path,
              isCopy: filesState.clipboardFile.value.isCopy
            })
          }}
        >
          {t('editor:layout.filebrowser.pasteAsset')}
        </Button>
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
            if (!selectedFiles.get(NO_PROXY).includes(file)) {
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
                  <ModelCompressionPanel selectedFiles={selectedFiles.value} refreshDirectory={onRefreshDirectory} />
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
                  <ImageCompressionPanel selectedFiles={selectedFiles.value} refreshDirectory={onRefreshDirectory} />
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
