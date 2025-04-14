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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { Entity, getSimulationCounterpart, hasComponent, useOptionalComponent } from '@ir-engine/ecs'
import { commitProperties, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { DistanceModel, DistanceModelOptions } from '@ir-engine/engine/src/audio/constants/AudioConstants'
import { useHookstate } from '@ir-engine/hyperflux'
import { Slider } from '@ir-engine/ui/editor'
import { FaAngleLeft } from 'react-icons/fa'
import { RiExpandUpDownLine } from 'react-icons/ri'
import { TfiAngleLeft } from 'react-icons/tfi'
import InputGroup from '../../../input/Group'
import NumericScrubber from '../../../input/Numeric/Scrubber'
import SegmentedControlInput from '../../../input/SegmentedControl'

/**
 * MediaNodeEditor used to render editor view for property customization.
 */

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

export interface PositionalAudioInputProps {
  entity: Entity
}

export const PositionalAudioInput = ({ entity }: PositionalAudioInputProps) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(entity)
  const positionalAudio = useOptionalComponent(simulationEntity, PositionalAudioComponent)
  const localAudioMode = useHookstate(hasComponent(entity, PositionalAudioComponent) ? 'positional' : 'ambient')

  return (
    <>
      <InputGroup name="Audio Mode" label={t('editor:properties.media.audiomode')}>
        <SegmentedControlInput
          value={localAudioMode.value}
          onChange={(val) => {
            let addFlag = false
            if (val === 'positional') {
              addFlag = true
            }
            EditorControlFunctions.addOrRemoveComponent([entity], PositionalAudioComponent, addFlag)
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
    </>
  )
}

export default PositionalAudioInput
