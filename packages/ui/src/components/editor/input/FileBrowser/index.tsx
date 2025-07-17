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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'

import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
//import useUpload from '../assets/useUpload'
import useUpload from '@ir-engine/editor/src/components/assets/useUpload'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { AllFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import { twMerge } from 'tailwind-merge'
import { ControlledStringInput, StringInputProps } from '../String'

export type FileBrowserInputProps = StringInputProps & { acceptFileTypes: string[]; acceptDropItems: string[] }

/**
 * Utility function to get thumbnail URL from a file value/URL
 * @param fileValue - The file URL or key
 * @returns Promise that resolves to thumbnail URL or null
 */
export const getThumbnailFromValue = async (fileValue: string): Promise<string | null> => {
  if (!fileValue || typeof fileValue !== 'string') return null

  try {
    // Extract the key from the file URL
    let key = fileValue.trim()

    // Handle different URL formats
    if (key.includes(config.client.fileServer)) {
      // Remove the file server URL to get the key
      key = key.replace(config.client.fileServer + '/', '')

      // Remove any query parameters or hash
      try {
        const url = new URL(fileValue)
        key = url.pathname.substring(1) // Remove leading slash
      } catch (urlError) {
        // If URL parsing fails, continue with simple string replacement
        console.warn('URL parsing failed, using simple string replacement:', urlError)
      }
    }

    // Remove any leading slashes
    key = key.replace(/^\/+/, '')

    if (!key) {
      console.warn('Empty key extracted from file value:', fileValue)
      return null
    }

    // Query the static resource by key
    const resourceQuery = (await API.instance.service(staticResourcePath).find({
      query: { key },
      paginate: false
    })) as any

    // When paginate: false, result is directly an array
    const resources = Array.isArray(resourceQuery) ? resourceQuery : resourceQuery.data || []

    if (resources.length === 0) {
      console.debug('No static resource found for key:', key)
      return null
    }

    const resource = resources[0]

    // Return the thumbnailURL if it exists and is valid
    if (resource.thumbnailURL && typeof resource.thumbnailURL === 'string') {
      return resource.thumbnailURL
    }

    console.debug('No thumbnail URL found for resource:', resource.id)
    return null
  } catch (error) {
    console.warn('Failed to get thumbnail for file value:', fileValue, error)
    return null
  }
}

/**
 * Hook to get thumbnail URL from a file value
 * @param fileValue - The file URL or key
 * @returns Object with thumbnailURL and loading state
 */
export const useThumbnailFromValue = (fileValue: string) => {
  const [thumbnailURL, setThumbnailURL] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fileValue) {
      setThumbnailURL(null)
      return
    }

    setLoading(true)
    getThumbnailFromValue(fileValue)
      .then(setThumbnailURL)
      .catch((error) => {
        console.warn('Failed to get thumbnail:', error)
        setThumbnailURL(null)
      })
      .finally(() => setLoading(false))
  }, [fileValue])

  return { thumbnailURL, loading }
}

/**
 * Function component used for rendering FileBrowserInput.
 */
export function FileBrowserInput({
  onRelease,
  value,
  acceptFileTypes,
  acceptDropItems,
  ...rest
}: FileBrowserInputProps) {
  const uploadOptions = {
    multiple: false,
    accepts: acceptFileTypes
  }
  const onUpload = useUpload(uploadOptions)

  // Get thumbnail from the current value
  const { thumbnailURL, loading: thumbnailLoading } = useThumbnailFromValue(value || '')

  // todo fix for invalid URLs
  const assetIsExternal = value && !value?.includes(config.client.fileServer) && !value.includes('blob:https://')
  const uploadExternalAsset = () => {
    onUpload([
      {
        isFile: true,
        name: value?.split('/').pop(),
        file: async (onSuccess, onFail) => {
          try {
            const asset = await fetch(value!)
            const blob = await asset.blob()
            const file = new File([blob], value!.split('/').pop()!)
            onSuccess(file)
          } catch (error) {
            if (onFail) onFail(error)
            else throw error
          }
        }
      } as Partial<FileSystemFileEntry>
    ] as any).then((assets) => {
      if (assets) {
        onRelease?.(assets[0])
      }
    })
  }

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [...acceptDropItems, ItemTypes.File],
    async drop(item: any, monitor) {
      const isDropType = acceptDropItems.find((element) => element === item.type)
      if (isDropType) {
        onRelease?.(item.url)
      } else {
        // https://github.com/react-dnd/react-dnd/issues/1345#issuecomment-538728576
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())

        onUpload(entries).then((assets) => {
          if (assets) {
            onRelease?.(assets[0])
          }
        })
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <div className={twMerge('w-full', isOver ? 'border-4 border-dashed border-ui-outline' : '')}>
      <div className="mt-2 flex items-center gap-2">
        {thumbnailLoading ? (
          <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-100">
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        ) : thumbnailURL ? (
          <img
            src={thumbnailURL}
            alt="File thumbnail"
            className="h-16 w-16 rounded border object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}

        {/* Fallback placeholder */}
        {!thumbnailLoading && !thumbnailURL && (
          <div className="flex h-16 w-16 items-center justify-center rounded border bg-gray-50">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Hidden fallback for image load errors */}
        <div className="hidden h-16 w-16 items-center justify-center rounded border bg-gray-50">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="flex flex-col">
          <ControlledStringInput ref={dropRef} value={value} onRelease={onRelease} {...rest} />
        </div>
      </div>
    </div>
  )
}

FileBrowserInput.defaultProps = {
  acceptFileTypes: AllFileTypes,
  acceptDropItems: AllFileTypes
}

export default FileBrowserInput
