import { useCallback, useContext } from 'react'
import ErrorDialog from '../dialogs/ErrorDialog'
import { ProgressDialog } from '../dialogs/ProgressDialog'
import { DialogContext } from '../contexts/DialogContext'
import { useTranslation } from 'react-i18next'
import { AllFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'
import { SourceManager } from '../../managers/SourceManager'

/**
 * useUpload used to upload asset file.
 *
 * @author Robert Long
 * @param  {object} options
 * @return {any}         [assets]
 */
export default function useUpload(options: any = {}) {
  const { t } = useTranslation()

  // initializing showDialog, hideDialog using dialogContext
  const { showDialog, hideDialog } = useContext(DialogContext)

  // initializing multiple if options contains multiple.
  const multiple = options.multiple === undefined ? false : options.multiple

  // initializing source if options contains source else use Source manager's defaultUploadSource
  const source = options.source || SourceManager.instance.defaultUploadSource

  //initializing accepts options using options.accepts
  //if options.accepts is not empty else set all types
  const accepts = options.accepts || AllFileTypes

  //function callback used when upload asset files.
  const onUpload = useCallback(
    //initailizing files by using assets files after upload.
    async (files) => {
      // initializing assets as an empty array
      let assets = []
      try {
        //check if not multiple and files contains length greator
        if (!multiple && files.length > 1) {
          throw new Error(t('editor:asset.useUpload.multipleFileError'))
        }

        //check if assets is not empty.
        if (accepts) {
          for (const file of files) {
            let accepted = false
            for (const pattern of accepts) {
              if (pattern.startsWith('.')) {
                if (file.name.endsWith(pattern)) {
                  accepted = true
                  break
                }
              } else if (file.type.startsWith(pattern)) {
                accepted = true
                break
              }
            }
            if (!accepted) {
              throw new Error(t('editor:asset.useUpload.mineTypeError', { name: file.name, types: accepts.join(', ') }))
            }
          }
        }
        const abortController = new AbortController()
        showDialog(ProgressDialog, {
          title: t('editor:asset.useUpload.progressTitle'),
          message: t('editor:asset.useUpload.progressMsg', { uploaded: 0, total: files.length, percentage: 0 }),
          cancelable: true,
          onCancel: () => {
            abortController.abort()
            hideDialog()
          }
        })

        //uploading files and showing ProgressDialog
        assets = await source.upload(
          files,
          (item, total, progress) => {
            showDialog(ProgressDialog, {
              title: t('editor:asset.useUpload.progressTitle'),
              message: t('editor:asset.useUpload.progressMsg', {
                uploaded: item,
                total,
                percentage: Math.round(progress * 100)
              }),
              cancelable: true,
              onCancel: () => {
                abortController.abort()
                hideDialog()
              }
            })
          },
          abortController.signal
        )
        hideDialog()
      } catch (error) {
        console.error(error)
        showDialog(ErrorDialog, {
          title: t('editor:asset.useUpload.uploadError'),
          message: t('editor:asset.useUpload.uploadErrorMsg', {
            message: error.message || t('editor:asset.useUpload.uploadErrorDefaultMsg')
          }),
          error
        })
        return null
      }
      return assets
    },
    [showDialog, hideDialog, source, multiple, accepts]
  )
  return onUpload
}
