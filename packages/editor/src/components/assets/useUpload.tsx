import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import multiLogger from '@xrengine/common/src/logger'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

import { getEntries, uploadProjectAssetsFromUpload } from '../../functions/assetFunctions'
import { accessEditorState } from '../../services/EditorServices'
import ErrorDialog from '../dialogs/ErrorDialog'
import { ProgressDialog } from '../dialogs/ProgressDialog'
import { useDialog } from '../hooks/useDialog'

const logger = multiLogger.child({ component: 'editor:useUpload' })

type Props = {
  multiple?: boolean
  accepts?: string[]
}

export default function useUpload(options: Props = {}) {
  const { t } = useTranslation()

  const [DialogComponent, setDialogComponent] = useDialog()

  const multiple = !!options.multiple
  const accepts = options.accepts || AllFileTypes

  const validateEntry = async (item) => {
    if (item.isDirectory) {
      let directoryReader = item.createReader()
      const entries = await getEntries(directoryReader)
      for (let index = 0; index < entries.length; index++) {
        await validateEntry(entries[index])
      }
    }

    if (item.isFile) {
      let accepted = false
      for (const pattern of accepts) {
        if (item.name.toLowerCase().endsWith(pattern)) {
          accepted = true
          break
        }
      }
      if (!accepted) {
        throw new Error(t('editor:asset.useUpload.mineTypeError', { name: item.name, types: accepts.join(', ') }))
      }
    }
  }

  const onUpload = useCallback(
    //initailizing files by using assets files after upload.
    async (entries: FileSystemEntry[]) => {
      try {
        //check if not multiple and files contains length greator
        if (!multiple && entries.length > 1) {
          throw new Error(t('editor:asset.useUpload.multipleFileError'))
        }

        //check if assets is not empty.
        if (accepts) {
          for (let index = 0; index < entries.length; index++) {
            await validateEntry(entries[index])
          }
        }
        const abortController = new AbortController()
        setDialogComponent(
          <ProgressDialog
            message={t('editor:asset.useUpload.progressMsg', { uploaded: 0, total: entries.length, percentage: 0 })}
            cancelable={true}
            onCancel={() => {
              abortController.abort()
              setDialogComponent(null)
            }}
          />
        )
        const { projectName } = accessEditorState().value
        const assets = await uploadProjectAssetsFromUpload(projectName!, entries, (item, total, progress) => {
          setDialogComponent(
            <ProgressDialog
              message={t('editor:asset.useUpload.progressMsg', {
                uploaded: item,
                total,
                percentage: Math.round(progress * 100)
              })}
              cancelable={true}
              onCancel={() => {
                assets.cancel()
                abortController.abort()
                setDialogComponent(null)
              }}
            />
          )
        })
        const result = await Promise.all(assets.promises)
        setDialogComponent(null)
        return result.flat()
      } catch (error) {
        logger.error(error, 'Error on upload')
        setDialogComponent(
          <ErrorDialog
            title={t('editor:asset.useUpload.uploadError')}
            message={t('editor:asset.useUpload.uploadErrorMsg', {
              message: error.message || t('editor:asset.useUpload.uploadErrorDefaultMsg')
            })}
            error={error}
          />
        )
        return null
      }
    },
    [multiple, accepts]
  )
  return onUpload
}
