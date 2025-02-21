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
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { NodeFunctions } from '@ir-engine/engine/src/gltf/NodeFunctions'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import { Checkbox } from '@ir-engine/ui'

import { GeneralAudioComponent } from '@ir-engine/engine/src/audio/components/GeneralAudioComponent'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { DistanceModel, DistanceModelOptions } from '@ir-engine/engine/src/audio/constants/AudioConstants'
import { useHookstate } from '@ir-engine/hyperflux'
import { FaAngleLeft, FaRegPauseCircle } from 'react-icons/fa'
import { FaRegCirclePlay } from 'react-icons/fa6'
import { PiSpeakerLowLight } from 'react-icons/pi'
import { RiExpandUpDownLine } from 'react-icons/ri'
import { TfiAngleLeft } from 'react-icons/tfi'
import ArrayInputGroup from '../../../input/Array'
import InputGroup from '../../../input/Group'
import NumericScrubber from '../../../input/Numeric/Scrubber'
import SegmentedControlInput from '../../../input/SegmentedControl'
import SelectInput from '../../../input/Select'
import Slider from '../../../Slider'

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

/**
 * GeneralAudioNodeEditor used to render editor view for property customization.
 */
export const GeneralAudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(props.entity)

  const audio = useComponent(simulationEntity, GeneralAudioComponent)
  const media = useOptionalComponent(simulationEntity, MediaComponent)
  const positionalAudio = useOptionalComponent(simulationEntity, PositionalAudioComponent)

  const mediaUUID = audio.mediaUUID.value
  const mediaEntity =
    audio.mediaUUID.value === ('' as NodeID)
      ? simulationEntity
      : NodeFunctions.getEntityFromNodeID(simulationEntity, mediaUUID)

  const mediaElement = getOptionalMutableComponent(mediaEntity, MediaElementComponent)
  const [mediaSourceValue, setMediaSourceValue] = useState(audio.mediaUUID.value === ('' as NodeID) ? 'Self' : 'Other')

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

  const toggle = () => {
    if (media) {
      media.paused.set(!media.paused.value)
    }
  }

  const mediaSourceChange = (val: string) => {
    setMediaSourceValue(val)
    if (val === 'Self') {
      commitProperty(GeneralAudioComponent, 'mediaUUID')('' as NodeID)
    } else {
      if (media) {
        media.paused.set(true)
      }
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

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
      Icon={GeneralAudioNodeEditor.iconComponent}
    >
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
          <SelectInput
            value={audio.mediaUUID.value}
            onChange={commitProperty(GeneralAudioComponent, 'mediaUUID')}
            options={mediaOptions}
          />
        </InputGroup>
      )}

      {mediaSourceValue === 'Self' && audio.mediaUUID.value === ('' as NodeID) && media && (
        <>
          <InputGroup
            name="SourcePaths"
            label={t('editor:properties.media.paths')}
            info={t('editor:properties.media.paths')}
          >
            {mediaElement && (
              <>
                <div className=" flex w-full justify-between gap-1 ">
                  <div className="flex h-8 w-full justify-between gap-2 rounded bg-surface-2 px-2">
                    <div onClick={toggle} className="my-auto h-6 w-6 cursor-pointer text-text-primary-button">
                      {media.paused.value && <FaRegCirclePlay className="h-full w-full " />}
                      {!media.paused.value && <FaRegPauseCircle className="h-full w-full " />}
                    </div>
                    <input
                      id={'audioScrubber'}
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
                </div>
              </>
            )}
            <ArrayInputGroup
              values={media.resources.value as string[]}
              dropTypes={[...ItemTypes.Audios]}
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
              key={props.entity}
              options={PlayModeOptions}
              value={media.playMode.value}
              onChange={commitProperty(MediaComponent, 'playMode')}
            />
          </InputGroup>
        </>
      )}
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

      {positionalAudio && (
        <>
          <InputGroup name="Distance Modal" label={t('editor:properties.audio.lbl-distanceModel')}>
            <SegmentedControlInput
              value={positionalAudio.distanceModel.value}
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
                value={positionalAudio.coneInnerAngle.value}
                onChange={(value) =>
                  updateConeAngle(
                    value,
                    true,
                    false,
                    positionalAudio.coneInnerAngle.value,
                    positionalAudio.coneOuterAngle.value
                  )
                }
                onRelease={(value) =>
                  updateConeAngle(
                    value,
                    true,
                    true,
                    positionalAudio.coneInnerAngle.value,
                    positionalAudio.coneOuterAngle.value
                  )
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
                value={positionalAudio.coneOuterAngle.value}
                onChange={(value) =>
                  updateConeAngle(
                    value,
                    false,
                    false,
                    positionalAudio.coneInnerAngle.value,
                    positionalAudio.coneOuterAngle.value
                  )
                }
                onRelease={(value) =>
                  updateConeAngle(
                    value,
                    false,
                    true,
                    positionalAudio.coneInnerAngle.value,
                    positionalAudio.coneOuterAngle.value
                  )
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
                value={positionalAudio.rolloffFactor.value}
                onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
                onRelease={commitProperty(PositionalAudioComponent, 'rolloffFactor')}
              />
            </InputGroup>

            <InputGroup
              name="Max Distance"
              disabled={positionalAudio.distanceModel.value !== DistanceModel.Linear}
              label={t('editor:properties.audio.lbl-maxDistance')}
              containerClassName="!pl-0 "
              info={
                positionalAudio.distanceModel.value !== DistanceModel.Linear
                  ? t('editor:properties.audio.info-maxDistanceDisabled')
                  : t('editor:properties.audio.info-maxDistance')
              }
            >
              <NumericScrubber
                min={0.00001}
                disabled={positionalAudio.distanceModel.value !== DistanceModel.Linear}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={positionalAudio.maxDistance.value}
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
              value={positionalAudio.coneOuterGain.value}
              onChange={updateProperty(PositionalAudioComponent, 'coneOuterGain')}
              onRelease={commitProperty(PositionalAudioComponent, 'coneOuterGain')}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

GeneralAudioNodeEditor.iconComponent = PiSpeakerLowLight

export default GeneralAudioNodeEditor
