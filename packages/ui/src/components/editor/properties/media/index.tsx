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

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Entity,
  getComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  getSimulationCounterpart,
  hasComponent,
  useComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { MediaComponent, MediaElementComponent, setTime } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import { useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Checkbox } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import { CgArrowsExpandRight } from 'react-icons/cg'
import { FaRegPauseCircle } from 'react-icons/fa'
import { FaRegCirclePlay } from 'react-icons/fa6'
import { IoCloseSharp } from 'react-icons/io5'
import { PiSpeakerLowLight } from 'react-icons/pi'
import Video from '../../../../primitives/tailwind/Video'
import ArrayInputGroup from '../../input/Array'
import InputGroup from '../../input/Group'
import SegmentedControlInput from '../../input/SegmentedControl'
import SelectInput from '../../input/Select'
import PositionalAudioInput from '../audio/positional'

/**
 * MediaNodeEditor used to render editor view for property customization.
 */

export enum MediaMode {
  video = 'video',
  audio = 'audio'
}

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

const mediaSourceOptions = [
  {
    label: 'This Player',
    value: 'Self'
  },
  {
    label: 'Sync With Other',
    value: 'Other'
  }
]

const audioModeOptions = [
  { label: 'Positional', value: 'positional' },
  { label: 'Ambient', value: 'ambient' }
]

export function updateConeAngle(
  value: number,
  isInner: boolean,
  commit: boolean,
  innerValue: number,
  outerValue: number
) {
  if (isInner) {
    if (commit) {
      commitProperties(PositionalAudioComponent, {
        coneInnerAngle: value,
        coneOuterAngle: value > outerValue ? value : undefined
      } as any)
    } else {
      updateProperty(PositionalAudioComponent, 'coneInnerAngle')(value)
      if (value > outerValue) {
        updateProperty(PositionalAudioComponent, 'coneOuterAngle')(value)
      }
    }
  } else {
    //outer
    if (commit) {
      commitProperties(PositionalAudioComponent, {
        coneOuterAngle: value,
        coneInnerAngle: value < innerValue ? value : undefined
      } as any)
    } else {
      updateProperty(PositionalAudioComponent, 'coneOuterAngle')(value)
      if (value < innerValue) {
        updateProperty(PositionalAudioComponent, 'coneInnerAngle')(value)
      }
    }
  }
}

export interface MediaInputProps {
  mediaMode: MediaMode
  entity: Entity
  mediaNodeId: NodeID
  OnMediaSourceUpdate: (value: NodeID) => void
  dropTypes?: string[]
}

export const MediaInput = ({ entity, mediaNodeId, OnMediaSourceUpdate, dropTypes, mediaMode }: MediaInputProps) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(entity)
  const media = useOptionalComponent(simulationEntity, MediaComponent)
  const mediaElement = getOptionalMutableComponent(simulationEntity, MediaElementComponent)

  const mediaEntities = useQuery([MediaComponent])
  const mediaOptions = mediaEntities
    .filter(
      (loopEntity) =>
        loopEntity !== entity &&
        loopEntity !== simulationEntity &&
        getOptionalComponent(loopEntity, NameComponent) !== undefined
    )
    .map((loopEntity) => {
      return {
        label: getComponent(loopEntity, NameComponent),
        value: getComponent(loopEntity, NodeIDComponent)
      }
    })

  const [mediaSourceValue, setMediaSourceValue] = useState(mediaNodeId === ('' as NodeID) ? 'Self' : 'Other')
  const currentTrackMin = useHookstate(0)
  const currentTrackMax = useHookstate(1)
  const currentTrackPercent = useHookstate(0)

  const positionalAudio = useOptionalComponent(simulationEntity, PositionalAudioComponent)
  const localAudioMode = useHookstate(hasComponent(entity, PositionalAudioComponent) ? 'positional' : 'ambient')

  const mediaSourceChange = (val: string) => {
    setMediaSourceValue(val)
    if (val === 'Self') {
      OnMediaSourceUpdate('' as NodeID)
    } else {
      if (media) {
        media.paused.set(true)
      }
    }
  }

  const toggle = () => {
    if (media) {
      media.paused.set(!media.paused.value)
    }
  }

  const handleSourcePathSelect = (index: number) => {
    media?.track.set(index)
  }

  function formatSeconds(seconds) {
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.round(seconds % 60)
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0')
    return `${formattedMinutes}:${formattedSeconds}`
  }

  const video = useOptionalComponent(simulationEntity, VideoComponent)
  const videoRef = useRef(null)
  const showVideoPreview = useHookstate(false)
  const videoPreviewHeight = useHookstate(0)
  const videoPreviewWidth = useHookstate(0)
  const videoPreviewParentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mediaMode !== MediaMode.video) return
    if (!showVideoPreview.value) return
    if (!mediaElement) return
    const sourceVideo = mediaElement.element.value as HTMLVideoElement
    if (!sourceVideo) return
    const previewVideo = videoRef.current as unknown as HTMLVideoElement
    if (!previewVideo) return
    const src = media?.resources.value[media?.track.value]
    previewVideo.src = src ? src : ''
  }, [media?.track, showVideoPreview, mediaElement])

  useEffect(() => {
    if (mediaMode !== MediaMode.video) return
    if (!showVideoPreview.value) return
    if (!mediaElement) return
    const sourceVideo = mediaElement.element.value as HTMLVideoElement
    if (!sourceVideo) return
    const previewVideo = videoRef.current as unknown as HTMLVideoElement
    if (!previewVideo) return
    previewVideo.currentTime = sourceVideo.currentTime
    if (!sourceVideo.paused) {
      previewVideo.play()
    } else {
      previewVideo.pause()
    }
  }, [media?.currentTrackTime, showVideoPreview])

  useEffect(() => {
    if (!video) return
    const ratio = video.currentVideoSize.x.value / video.currentVideoSize.y.value || 1
    const height = videoPreviewWidth.value / ratio
    videoPreviewHeight.set(height)
  }, [video?.currentVideoSize, videoPreviewWidth])

  useEffect(() => {
    if (media && (media.resources.length < 1 || media.resources.length <= media.track.value)) {
      media.track.set(-1)
    }
  }, [media?.resources])

  useEffect(() => {
    if (!media) return
    currentTrackMax.set(media.currentTrackDuration.value)
    currentTrackPercent.set(
      Math.round(
        ((media.currentTrackTime.value - currentTrackMin.value) / (currentTrackMax.value - currentTrackMin.value)) * 100
      )
    )
  }, [media?.currentTrackDuration, media?.currentTrackTime])

  return (
    <>
      <InputGroup
        name="Media"
        label={t('editor:properties.audio.lbl-media')}
        info={t('editor:properties.audio.lbl-media-info')}
      >
        <SegmentedControlInput value={mediaSourceValue} onChange={mediaSourceChange} options={mediaSourceOptions} />
      </InputGroup>

      {mediaSourceValue !== 'Self' && (
        <InputGroup
          name="SynchronizedMedia"
          label={t('editor:properties.audio.lbl-synchronized-media-source')}
          info={t('editor:properties.audio.lbl-synchronized-media-source-info')}
        >
          <SelectInput value={mediaNodeId} onChange={OnMediaSourceUpdate} options={mediaOptions} />
        </InputGroup>
      )}

      {mediaSourceValue === 'Self' && mediaNodeId === ('' as NodeID) && media && (
        <>
          <InputGroup
            name="SourcePaths"
            label={t('editor:properties.media.paths')}
            info={t('editor:properties.media.paths')}
          >
            {mediaElement && (
              <>
                {mediaMode == MediaMode.video && showVideoPreview.value && (
                  <div ref={videoPreviewParentRef} className="my-1">
                    <div className={'relative aspect-video w-full'}>
                      <Video
                        volume={0}
                        autoPlay={false}
                        ref={videoRef}
                        className="absolute right-0 top-0 h-full w-full "
                      />
                      <button
                        className="absolute right-0 top-0 h-6 w-6 place-items-center text-text-primary-button"
                        onClick={() => {
                          showVideoPreview.set(false)
                        }}
                      >
                        <IoCloseSharp />
                      </button>
                    </div>
                  </div>
                )}
                <div className=" flex w-full justify-between gap-1 ">
                  <div className="flex h-8 w-full justify-between gap-2 rounded bg-surface-2 px-2">
                    <div onClick={toggle} className="my-auto h-6 w-6 cursor-pointer text-text-primary-button">
                      {media.paused.value && <FaRegCirclePlay className="h-full w-full " />}
                      {!media.paused.value && <FaRegPauseCircle className="h-full w-full " />}
                    </div>
                    <input
                      id={'mediaScrubber'}
                      min={currentTrackMin.value}
                      max={currentTrackMax.value}
                      step={0.05}
                      value={media.currentTrackTime.value}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const val = parseFloat(event.target.value)
                        setTime(mediaElement.element, val)
                      }}
                      type="range"
                      style={{
                        background: `linear-gradient(to right, var(--ui-select-primary) ${currentTrackPercent.value}%, var(--ui-inactive-tertiary) ${currentTrackPercent.value}%)`
                      }}
                      className={`[&::-moz-range-track]:bg-ui-inactive-tertiar my-auto h-1 w-full min-w-20 cursor-pointer appearance-none overflow-hidden rounded bg-ui-inactive-tertiary
                        focus:outline-none disabled:pointer-events-none
                        disabled:opacity-50
                        [&::-moz-range-progress]:bg-ui-select-primary
                        [&::-moz-range-thumb]:h-full
                        [&::-moz-range-thumb]:w-2
                        [&::-moz-range-thumb]:appearance-none
                        [&::-moz-range-thumb]:rounded
                        [&::-moz-range-thumb]:bg-ui-select-secondary
                        [&::-moz-range-thumb]:transition-all
                        [&::-moz-range-thumb]:duration-150
                        [&::-moz-range-thumb]:ease-in-out
                        group-hover/editor-slider:[&::-moz-range-thumb]:bg-ui-select-secondary 
                        [&::-moz-range-track]:h-full
                        [&::-moz-range-track]:w-full
                        [&::-moz-range-track]:rounded
                        [&::-webkit-slider-runnable-track]:h-full
                        [&::-webkit-slider-runnable-track]:w-full
                        [&::-webkit-slider-runnable-track]:rounded
                        [&::-webkit-slider-thumb]:h-full
                        [&::-webkit-slider-thumb]:w-2
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:rounded
                        [&::-webkit-slider-thumb]:bg-ui-select-secondary
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:ease-in-out
                        group-hover/editor-slider:[&::-webkit-slider-thumb]:bg-ui-select-secondary 
                      `}
                      data-testid="slider-draggable-value-input"
                    />
                    <div className="my-auto inline-block text-xs text-text-secondary ">
                      {formatSeconds(media.currentTrackTime.value)}/{formatSeconds(media.currentTrackDuration.value)}
                    </div>
                  </div>
                  {mediaMode === MediaMode.video && !showVideoPreview.value && (
                    <button
                      className="my-auto h-8 w-9 place-items-center rounded bg-surface-2 text-text-primary-button"
                      onClick={() => {
                        showVideoPreview.set(true)
                      }}
                    >
                      <CgArrowsExpandRight />
                    </button>
                  )}
                </div>
              </>
            )}
            <ArrayInputGroup
              values={media.resources.value as string[]}
              dropTypes={dropTypes}
              onChange={commitProperty(MediaComponent, 'resources')}
              selectedIndex={media.track.value}
              SelectIcon={PiSpeakerLowLight}
              onSelect={handleSourcePathSelect}
            />
          </InputGroup>

          <InputGroup
            name="Volume"
            label={t('editor:properties.media.lbl-volume')}
            info={t('editor:properties.media.lbl-volume')}
          >
            <Slider
              min={0}
              max={10}
              step={0.1}
              value={media.volume.value}
              onChange={updateProperty(MediaComponent, 'volume')}
              onRelease={commitProperty(MediaComponent, 'volume')}
              aria-label="Volume"
            />
          </InputGroup>

          <InputGroup
            name="MediaOptions"
            label={t('editor:properties.media.lbl-mediaOptions')}
            info={t('editor:properties.media.info-mediaOptions')}
          >
            <Checkbox
              label={t('editor:properties.media.lbl-mediaSynchronize')}
              variantTextPlacement={'right'}
              checked={media.synchronize.value}
              onChange={commitProperty(MediaComponent, 'synchronize')}
            />
            <Checkbox
              label={t('editor:properties.media.lbl-autoplay')}
              variantTextPlacement={'right'}
              checked={media.autoplay.value}
              onChange={commitProperty(MediaComponent, 'autoplay')}
            />
            <Checkbox
              label={t('editor:properties.media.lbl-muteEditor')}
              variantTextPlacement={'right'}
              checked={media.muteEditor.value}
              onChange={commitProperty(MediaComponent, 'muteEditor')}
            />
          </InputGroup>

          <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
            <SelectInput
              key={entity}
              options={PlayModeOptions}
              value={media.playMode.value}
              onChange={commitProperty(MediaComponent, 'playMode')}
            />
          </InputGroup>
        </>
      )}
      <PositionalAudioInput entity={entity} />
    </>
  )
}

/**
 * MediaNodeEditor used to render editor view for property customization.
 */
export const MediaNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const simulationEntity = getSimulationCounterpart(props.entity)
  const audio = useComponent(simulationEntity, MediaComponent)
  const hasVideo = hasComponent(simulationEntity, VideoComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

  return (
    <>
      {!hasVideo && (
        <NodeEditor
          {...props}
          name={t('editor:properties.audio.name')}
          description={t('editor:properties.audio.description')}
          Icon={MediaNodeEditor.iconComponent}
        >
          <MediaInput
            mediaMode={MediaMode.audio}
            entity={props.entity}
            mediaNodeId={audio.externalMediaNodeID.value}
            OnMediaSourceUpdate={commitProperty(MediaComponent, 'externalMediaNodeID')}
            dropTypes={[...ItemTypes.Audios]}
          />
        </NodeEditor>
      )}
    </>
  )
}

MediaNodeEditor.iconComponent = PiSpeakerLowLight

export default MediaNodeEditor
