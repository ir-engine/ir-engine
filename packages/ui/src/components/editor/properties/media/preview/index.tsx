import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Text from '../../../../../primitives/tailwind/Text'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'

interface MediaPlayerProps {
  resources: ReadonlyArray<string>
}

const MediaPreview: React.FC<MediaPlayerProps> = ({ resources }) => {
  const { t } = useTranslation()

  // Get the array of URLs as strings based on the type
  const resourceList = resources
  const options = resourceList.map((resource) => ({
    label: resource.split('/').pop()!.split('?')[0] || resource, // Display file name
    value: resource
  }))
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const [selectedMedia, setSelectedMedia] = useState(resourceList[0])
  const [mediaType, setMediaType] = useState(getMediaType(resourceList[0]))

  // Helper function to determine media type based on file extension
  function getMediaType(url: string) {
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0]
    return ['mp4', 'webm'].includes(extension || '') ? 'video' : 'audio'
  }

  // Handle media selection change
  const handleMediaChange = (value: string) => {
    const selectedUrl = value
    setSelectedMedia(selectedUrl)
    setMediaType(getMediaType(selectedUrl))
    if (mediaRef.current) {
      mediaRef.current.load() // Reload the media file
    }
  }

  return (
    <div className={'flex-grow space-y-1 rounded-md bg-[#1A1A1A] py-1.5'}>
      <Text className="ml-5">{t('editor:properties.media-preview.lbl-mediaPreview')}</Text>
      {/* Dropdown to select media file */}
      <InputGroup label={t('editor:properties.media-preview.lbl-selected-source')}>
        <SelectInput
          value={selectedMedia}
          options={options}
          onChange={(e) => handleMediaChange(e as string)}
          className="mb-2 flex-grow"
        />
      </InputGroup>

      {mediaType === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={selectedMedia}
          width="300"
          controls={true}
          className="w-full flex-grow"
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={selectedMedia}
          controls={true}
          className="w-full flex-grow"
        />
      )}
    </div>
  )
}

export default MediaPreview
