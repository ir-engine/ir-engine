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

import { State, useHookstate } from '@ir-engine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import Text from '../../../../../primitives/tailwind/Text'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'

interface MediaPlayerProps {
  resources: State<string[]> //  State<ArrayStatic<TStringSchema>, {}>// ReadonlyArray<string>
}

const MediaPreview: React.FC<MediaPlayerProps> = ({ resources }) => {
  const { t } = useTranslation()

  // Get the array of URLs as strings based on the type
  const resourceList = resources.value
  const options = resourceList.map((resource) => ({
    label: resource.split('/').pop()!.split('?')[0] || resource, // Display file name
    value: resource
  }))
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const selectedMedia = useHookstate(resourceList[0])
  const mediaType = useHookstate(getMediaType(resourceList[0]))

  // Helper function to determine media type based on file extension
  function getMediaType(url: string) {
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0]
    return ['mp4', 'webm'].includes(extension || '') ? 'video' : 'audio'
  }

  // Handle media selection change
  const handleMediaChange = (value: string) => {
    const selectedUrl = value
    selectedMedia.set(selectedUrl)
    mediaType.set(getMediaType(selectedUrl))
    if (mediaRef.current) {
      mediaRef.current.load() // Reload the media file
    }
  }

  useEffect(() => {
    handleMediaChange(resourceList[0] ?? '')
  }, [resources])

  return (
    <div
      id={'media-preview-root-div'}
      className={'flex-grow space-y-1 rounded-md border-2 border-solid border-gray-600 bg-[#1F1F1F] py-1.5'}
    >
      <div id={'media-preview-label'} className={'flex-column mb-2 flex gap-2'}>
        <Text className="ml-5">{t('editor:properties.media-preview.lbl-mediaPreview')}</Text>
        <Tooltip content={t('editor:properties.media-preview.info-mediaPreview')}>
          <LuInfo className={twMerge('h-5 w-5', 'text-[#A0A1A2]')} />
        </Tooltip>
      </div>
      {/* Dropdown to select media file */}
      <InputGroup label={t('editor:properties.media-preview.lbl-selected-source')}>
        <SelectInput value={selectedMedia.value} options={options} onChange={(e) => handleMediaChange(e as string)} />
      </InputGroup>

      {mediaType.value === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={selectedMedia.value}
          width="300"
          controls={true}
          className="w-full flex-grow p-2.5"
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={selectedMedia.value}
          controls={true}
          className="w-full flex-grow p-2.5"
        />
      )}
    </div>
  )
}

export default MediaPreview
