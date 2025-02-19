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

import {
  getComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  getSimulationCounterpart,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaComponent, MediaElementComponent, setTime } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CgArrowsExpandRight } from 'react-icons/cg'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { NodeFunctions } from '@ir-engine/engine/src/gltf/NodeFunctions'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import { Checkbox } from '@ir-engine/ui'
import { BackSide, ClampToEdgeWrapping, DoubleSide, FrontSide, MirroredRepeatWrapping, RepeatWrapping } from 'three'
import { Slider } from '../../../../../editor'

import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { DistanceModel, DistanceModelOptions } from '@ir-engine/engine/src/audio/constants/AudioConstants'
import { useHookstate } from '@ir-engine/hyperflux'
import { FaAngleLeft, FaRegPauseCircle } from 'react-icons/fa'
import { FaRegCirclePlay } from 'react-icons/fa6'
import { IoCloseSharp } from 'react-icons/io5'
import { RiExpandUpDownLine } from 'react-icons/ri'
import { TfiAngleLeft } from 'react-icons/tfi'
import Video from '../../../../primitives/tailwind/Video'
import ArrayInputGroup from '../../../editor/input/Array'
import InputGroup from '../../../editor/input/Group'
import NumericScrubber from '../../input/Numeric/Scrubber'
import SegmentedControlInput from '../../input/SegmentedControl'
import SelectInput from '../../input/Select'
import Vector2Input from '../../input/Vector2'
import { updateConeAngle } from '../audio/positional'

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

const audioModeOptions = [
  { label: 'Positional', value: 'positional' },
  { label: 'Ambient', value: 'ambient' }
]

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

const projectionOptions = [
  { label: 'Flat', value: 'Flat' },
  { label: 'Equirectangular360', value: 'Equirectangular360' }
]

const wrappingOptions = [
  { label: 'Repeat', value: RepeatWrapping },
  { label: 'Clamp', value: ClampToEdgeWrapping },
  { label: 'Mirrored Repeat', value: MirroredRepeatWrapping }
]

/**
 * VideoNodeEditor used to render editor view for property customization.
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(props.entity)
  const video = useComponent(simulationEntity, VideoComponent)
  const media = useOptionalComponent(simulationEntity, MediaComponent)
  const audio = getOptionalMutableComponent(simulationEntity, PositionalAudioComponent)

  const mediaUUID = video.mediaUUID.value
  const mediaEntity =
    video.mediaUUID.value === ('' as NodeID)
      ? simulationEntity
      : NodeFunctions.getEntityFromNodeID(simulationEntity, mediaUUID)

  const mediaElement = getOptionalMutableComponent(mediaEntity, MediaElementComponent)
  const [mediaSourceValue, setMediaSourceValue] = useState(video.mediaUUID.value === ('' as NodeID) ? 'Self' : 'Other')

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

  const mediaEntities = useQuery([MediaComponent])
  const mediaOptions = mediaEntities
    .filter(
      (entity) =>
        entity !== props.entity &&
        entity !== simulationEntity &&
        getOptionalComponent(entity, NameComponent) !== undefined
    )
    .map((entity) => {
      return {
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, NodeIDComponent)
      }
    })
  mediaOptions.unshift({ label: 'Self', value: '' as NodeID })

  const toggle = () => {
    if (media) {
      media.paused.set(!media.paused.value)
    }
  }

  const mediaSourceChange = (val: string) => {
    setMediaSourceValue(val)
    if (val === 'Self') {
      commitProperty(VideoComponent, 'mediaUUID')('' as NodeID)
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

  const localAudioMode = useHookstate(hasComponent(props.entity, PositionalAudioComponent) ? 'positional' : 'ambient')
  const currentTrackMin = useHookstate(0)
  const currentTrackMax = useHookstate(1)
  const currentTrackPercent = useHookstate(0)

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

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

  const videoRef = useRef(null)
  const showVideoPreview = useHookstate(false)
  const videoPreviewHeight = useHookstate(0)
  const videoPreviewWidth = useHookstate(0)
  const videoPreviewParentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
    const ratio = video.currentVideoSize.x.value / video.currentVideoSize.y.value || 1
    const height = videoPreviewWidth.value / ratio
    videoPreviewHeight.set(height)
  }, [video.currentVideoSize, videoPreviewWidth])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
      Icon={VideoNodeEditor.iconComponent}
    >
      <InputGroup
        name="Media"
        label={t('editor:properties.video.lbl-media')}
        info={t('editor:properties.video.lbl-media-info')}
      >
        <SegmentedControlInput value={mediaSourceValue} onChange={mediaSourceChange} options={mediaSourceOptions} />
      </InputGroup>

      {mediaSourceValue !== 'Self' && (
        <InputGroup
          name="SynchronizedMedia"
          label={t('editor:properties.video.lbl-synchronized-media-source')}
          info={t('editor:properties.video.lbl-synchronized-media-source-info')}
        >
          <SelectInput
            value={video.mediaUUID.value}
            onChange={commitProperty(VideoComponent, 'mediaUUID')}
            options={mediaOptions}
          />
        </InputGroup>
      )}

      {mediaSourceValue === 'Self' && video.mediaUUID.value === ('' as NodeID) && media && (
        <>
          <InputGroup
            name="SourcePaths"
            label={t('editor:properties.media.paths')}
            info={t('editor:properties.media.paths')}
          >
            {mediaElement && (
              <>
                {showVideoPreview.value && (
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
                    <div onClick={toggle} className="my-auto h-6 w-6 text-text-primary-button">
                      {media.paused.value && <FaRegCirclePlay className="h-full w-full " />}
                      {!media.paused.value && <FaRegPauseCircle className="h-full w-full " />}
                    </div>
                    <input
                      id={'videoScrubber'}
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
                  {!showVideoPreview.value && (
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
              dropTypes={[...ItemTypes.Videos]}
              onChange={commitProperty(MediaComponent, 'resources')}
              selectedIndex={media.track.value}
              SelectIcon={HiOutlineVideoCamera}
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
              label={t('editor:properties.media.lbl-controls')}
              variantTextPlacement={'right'}
              checked={media.controls.value}
              onChange={commitProperty(MediaComponent, 'controls')}
            />
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
              key={props.entity}
              options={PlayModeOptions}
              value={media.playMode.value}
              onChange={commitProperty(MediaComponent, 'playMode')}
            />
          </InputGroup>

          <InputGroup name="Audio Mode" label={t('editor:properties.media.audiomode')}>
            <SegmentedControlInput
              value={localAudioMode.value}
              onChange={(val) => {
                let addFlag = false
                if (val === 'positional') {
                  addFlag = true
                }
                EditorControlFunctions.addOrRemoveComponent([props.entity], PositionalAudioComponent, addFlag)
              }}
              options={audioModeOptions}
            />
          </InputGroup>

          {audio && (
            <>
              <InputGroup name="Distance Modal" label={t('editor:properties.audio.lbl-distanceModel')}>
                <SegmentedControlInput
                  value={audio.distanceModel.value}
                  options={DistanceModelOptions}
                  onChange={commitProperty(PositionalAudioComponent, 'distanceModel')}
                />
              </InputGroup>

              <InputGroup
                name="Cone Angle"
                label={t('editor:properties.audio.lbl-coneAngle')}
                info={t('editor:properties.audio.info-coneAngle')}
              >
                <div className="grid w-full grid-flow-col grid-rows-1 gap-1">
                  <NumericScrubber
                    SuffixIcon={RiExpandUpDownLine}
                    suffixIconClassName={'text-text-inactive ml-1 w-7 h-7'}
                    PreFixIcon={FaAngleLeft}
                    prefixIconClassName={'text-text-inactive mr-1'}
                    prefix={t('editor:properties.audio.lbl-coneOuterAngle').toUpperCase()}
                    prefixClassName={'text-text-inactive mr-1'}
                    min={0}
                    max={360}
                    smallStep={0.1}
                    mediumStep={1}
                    largeStep={10}
                    value={audio.coneInnerAngle.value}
                    onChange={(value) =>
                      updateConeAngle(value, true, false, audio.coneInnerAngle.value, audio.coneOuterAngle.value)
                    }
                    onRelease={(value) =>
                      updateConeAngle(value, true, true, audio.coneInnerAngle.value, audio.coneOuterAngle.value)
                    }
                    unit="°"
                    inputClassName="text-right"
                  />

                  <NumericScrubber
                    SuffixIcon={RiExpandUpDownLine}
                    suffixIconClassName={'text-text-inactive ml-1 w-7 h-7'}
                    PreFixIcon={TfiAngleLeft}
                    prefixIconClassName={'text-text-inactive mr-1]'}
                    prefix={t('editor:properties.audio.lbl-coneInnerAngle').toUpperCase()}
                    prefixClassName={'text-text-inactive mr-1'}
                    min={0}
                    max={360}
                    smallStep={0.1}
                    mediumStep={1}
                    largeStep={10}
                    value={audio.coneOuterAngle.value}
                    onChange={(value) =>
                      updateConeAngle(value, false, false, audio.coneInnerAngle.value, audio.coneOuterAngle.value)
                    }
                    onRelease={(value) =>
                      updateConeAngle(value, false, true, audio.coneInnerAngle.value, audio.coneOuterAngle.value)
                    }
                    unit="°"
                    inputClassName="text-right"
                  />
                </div>
              </InputGroup>

              <div className="grid w-full grid-flow-col grid-rows-1 gap-3 ">
                <InputGroup
                  name="Rolloff Factor"
                  label={t('editor:properties.audio.lbl-rolloffFactor')}
                  info={t('editor:properties.audio.info-rfInfinity')}
                  containerClassName="pr-0 "
                >
                  <NumericScrubber
                    min={0}
                    smallStep={0.1}
                    mediumStep={1}
                    largeStep={10}
                    value={audio.rolloffFactor.value}
                    onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
                    onRelease={commitProperty(PositionalAudioComponent, 'rolloffFactor')}
                  />
                </InputGroup>

                <InputGroup
                  name="Max Distance"
                  disabled={audio.distanceModel.value !== DistanceModel.Linear}
                  label={t('editor:properties.audio.lbl-maxDistance')}
                  containerClassName="!pl-0 "
                  info={
                    audio.distanceModel.value !== DistanceModel.Linear
                      ? t('editor:properties.audio.info-maxDistanceDisabled')
                      : t('editor:properties.audio.info-maxDistance')
                  }
                >
                  <NumericScrubber
                    min={0.00001}
                    disabled={audio.distanceModel.value !== DistanceModel.Linear}
                    smallStep={0.1}
                    mediumStep={1}
                    largeStep={10}
                    value={audio.maxDistance.value}
                    onChange={updateProperty(PositionalAudioComponent, 'maxDistance')}
                    onRelease={commitProperty(PositionalAudioComponent, 'maxDistance')}
                    unit="m"
                  />
                </InputGroup>
              </div>

              <InputGroup
                name="Cone Inner Angle"
                label={t('editor:properties.audio.lbl-coreOuterGain')}
                info={t('editor:properties.audio.info-coreOuterGain')}
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={audio.coneOuterGain.value}
                  onChange={updateProperty(PositionalAudioComponent, 'coneOuterGain')}
                  onRelease={commitProperty(PositionalAudioComponent, 'coneOuterGain')}
                />
              </InputGroup>
            </>
          )}

          <InputGroup
            name="Video Fit"
            label={t('editor:properties.video.lbl-fit')}
            info={t('editor:properties.video.lbl-fit-info')}
          >
            <SelectInput
              value={video.fit.value}
              onChange={commitProperty(VideoComponent, 'fit')}
              options={fitOptions}
            />
          </InputGroup>

          <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
            <SegmentedControlInput
              value={video.projection.value}
              onChange={commitProperty(VideoComponent, 'projection')}
              options={projectionOptions}
            />
          </InputGroup>

          <InputGroup
            name="Side"
            label={t('editor:properties.video.lbl-side')}
            info={t('editor:properties.video.lbl-side-info')}
          >
            <SegmentedControlInput
              value={video.side.value}
              onChange={commitProperty(VideoComponent, 'side')}
              options={[
                { label: 'Front', value: FrontSide },
                { label: 'Back', value: BackSide },
                { label: 'Double', value: DoubleSide }
              ]}
            />
          </InputGroup>

          <InputGroup
            name="Video Size"
            label={t('editor:properties.video.lbl-size')}
            info={t('editor:properties.video.lbl-size-info')}
          >
            <Vector2Input
              value={video.size.value}
              onChange={updateProperty(VideoComponent, 'size')}
              onRelease={commitProperty(VideoComponent, 'size')}
              axisClassNames={['w-1/2', 'w-1/2']}
            />
          </InputGroup>

          <InputGroup
            name="UV Offset"
            label={t('editor:properties.video.lbl-uv-offset')}
            info={t('editor:properties.video.lbl-uv-offset-info')}
          >
            <Vector2Input
              value={video.uvOffset.value}
              onChange={updateProperty(VideoComponent, 'uvOffset')}
              onRelease={commitProperty(VideoComponent, 'uvOffset')}
              axisClassNames={['w-1/2', 'w-1/2']}
            />
          </InputGroup>

          <InputGroup
            name="UV Scale"
            label={t('editor:properties.video.lbl-uv-scale')}
            info={t('editor:properties.video.lbl-uv-scale-info')}
          >
            <Vector2Input
              value={video.uvScale.value}
              onChange={updateProperty(VideoComponent, 'uvScale')}
              onRelease={commitProperty(VideoComponent, 'uvScale')}
              axisClassNames={['w-1/2', 'w-1/2']}
            />
          </InputGroup>
          <InputGroup
            name="Wrap"
            label={t('editor:properties.video.lbl-wrap')}
            info={t('editor:properties.video.lbl-wrap-info')}
          >
            <div className="flex w-full">
              <div className="flex w-1/2">
                <SelectInput
                  value={video.wrapS.value}
                  onChange={commitProperty(VideoComponent, 'wrapS')}
                  options={wrappingOptions}
                />
              </div>
              <div className="flex w-1/2">
                <SelectInput
                  value={video.wrapT.value}
                  onChange={commitProperty(VideoComponent, 'wrapT')}
                  options={wrappingOptions}
                />
              </div>
            </div>
          </InputGroup>
        </>
      )}

      <InputGroup
        name="Use Alpha"
        label={t('editor:properties.video.lbl-use-alpha')}
        info={t('editor:properties.video.lbl-use-alpha-info')}
      >
        <Checkbox
          label={t('editor:properties.video.lbl-use-alphaEnable')}
          variantTextPlacement={'right'}
          checked={video.useAlpha.value}
          onChange={commitProperty(VideoComponent, 'useAlpha')}
        />

        {video.useAlpha.value && (
          <>
            <Checkbox
              label={t('editor:properties.video.lbl-use-alphaInvert')}
              variantTextPlacement={'right'}
              checked={video.useAlphaInvert.value}
              onChange={commitProperty(VideoComponent, 'useAlphaInvert')}
            />

            <Slider
              label={t('editor:properties.video.lbl-alpha-threshold')}
              min={0}
              max={1}
              step={0.01}
              value={video.alphaThreshold.value}
              onChange={updateProperty(VideoComponent, 'alphaThreshold')}
              onRelease={commitProperty(VideoComponent, 'alphaThreshold')}
              aria-label="alphaThreshold"
            />

            <InputGroup
              label={t('editor:properties.video.lbl-use-alpha-uv-transform')}
              info={t('editor:properties.video.lbl-use-alpha-uv-transform-info')}
            >
              <Vector2Input
                value={video.alphaUVOffset.value}
                onChange={updateProperty(VideoComponent, 'alphaUVOffset')}
                onRelease={commitProperty(VideoComponent, 'alphaUVOffset')}
                axisLabels={['U', 'V']}
                axisClassNames={['w-1/2', 'w-1/2']}
              />
            </InputGroup>
          </>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
