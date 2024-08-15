/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import multiLogger from '@etherealengine/common/src/logger'
import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import { getState } from '@etherealengine/hyperflux'

import { getEntries, uploadProjectAssetsFromUpload } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'

const logger = multiLogger.child({ component: 'editor:useUpload' })

type Props = {
  multiple?: boolean
  accepts?: string[]
}

/**@deprecated throws error on the server - to be replaced with newer ui implementation */
export default function useUpload(options: Props = {}) {
  const { t } = useTranslation()

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
        const { projectName } = getState(EditorState)
        const assets = await uploadProjectAssetsFromUpload(projectName!, entries)
        const result = await Promise.all(assets.promises)
        return result.flat()
      } catch (error) {
        logger.error(error, 'Error on upload')
        return null
      }
    },
    [multiple, accepts]
  )
  return onUpload
}
