import React from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import useSetPropertySelected, { EditorComponentType, updateProperty } from './Util'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { AudioType, DistanceModel } from '@xrengine/engine/src/audio/constants/AudioConstants'

const AudioTypeOptions = [
  { label: AudioType.Stereo, value: AudioType.Stereo },
  { label: AudioType.Positional, value: AudioType.Positional }
]

const DistanceModelOptions = [
  { label: 'Linear', value: DistanceModel.Linear },
  { label: 'Inverse', value: DistanceModel.Inverse },
  { label: 'Exponential', value: DistanceModel.Exponential }
]

/**
 *
 * AudioSourceProperties provides properties to custom audio element on the scene
 * used inside AudioNodeEditor component.
 *
 * @author Robert Long
 * @param       {any} node
 * @param       {any} multiEdit
 * @constructor
 */

export const AudioSourceProperties: EditorComponentType = (props) => {
  const onChangeControls = useSetPropertySelected('controls')
  const onChangeAutoPlay = useSetPropertySelected('autoPlay')
  const onChangeSynchronize = useSetPropertySelected('synchronize')
  const onChangeLoop = useSetPropertySelected('loop')
  const { t } = useTranslation()

  const audioComponent = getComponent(props.node.entity, AudioComponent)

  return (
    <>
      <InputGroup name="Audio Type" label={t('editor:properties.audio.lbl-audioType')}>
        <SelectInput
          options={AudioTypeOptions}
          value={audioComponent.audioType}
          onChange={(v) => updateProperty(AudioComponent, 'audioType', v)}
        />
      </InputGroup>
      <InputGroup name="Volume" label={t('editor:properties.audio.lbl-volume')}>
        <CompoundNumericInput
          value={audioComponent.volume}
          onChange={(v) => updateProperty(AudioComponent, 'volume', v)}
        />
      </InputGroup>
      {!props.multiEdit && audioComponent.audioType === AudioType.Positional && (
        <>
          <InputGroup
            name="Distance Model"
            label={t('editor:properties.audio.lbl-distanceModel')}
            info={t('editor:properties.audio.info-distanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioComponent.distanceModel}
              onChange={(v) => updateProperty(AudioComponent, 'distanceModel', v)}
            />
          </InputGroup>

          {audioComponent.distanceModel === DistanceModel.Linear ? (
            <InputGroup
              name="Rolloff Factor"
              label={t('editor:properties.audio.lbl-rolloffFactor')}
              info={t('editor:properties.audio.info-rolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={audioComponent.rolloffFactor}
                onChange={(v) => updateProperty(AudioComponent, 'rolloffFactor', v)}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Rolloff Factor"
              label={t('editor:properties.audio.lbl-rolloffFactor')}
              info={t('editor:properties.audio.info-rfInfinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioComponent.rolloffFactor}
              onChange={(v) => updateProperty(AudioComponent, 'rolloffFactor', v)}
            />
          )}
          <NumericInputGroup
            name="Ref Distance"
            label={t('editor:properties.audio.lbl-refDistance')}
            info={t('editor:properties.audio.info-refDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.refDistance}
            onChange={(v) => updateProperty(AudioComponent, 'refDistance', v)}
            unit="m"
          />
          <NumericInputGroup
            name="Max Distance"
            label={t('editor:properties.audio.lbl-maxDistance')}
            info={t('editor:properties.audio.info-maxDistance')}
            min={0.00001}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.maxDistance}
            onChange={(v) => updateProperty(AudioComponent, 'maxDistance', v)}
            unit="m"
          />
          <NumericInputGroup
            name="Cone Inner Angle"
            label={t('editor:properties.audio.lbl-coneInnerAngle')}
            info={t('editor:properties.audio.info-coneInnerAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.coneInnerAngle}
            onChange={(v) => updateProperty(AudioComponent, 'coneInnerAngle', v)}
            unit="°"
          />
          <NumericInputGroup
            name="Cone Outer Angle"
            label={t('editor:properties.audio.lbl-coneOuterAngle')}
            info={t('editor:properties.audio.info-coneOuterAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioComponent.coneOuterAngle}
            onChange={(v) => updateProperty(AudioComponent, 'coneOuterAngle', v)}
            unit="°"
          />
          <InputGroup
            name="Cone Outer Gain"
            label={t('editor:properties.audio.lbl-coreOuterGain')}
            info={t('editor:properties.audio.info-coreOuterGain')}
          >
            <CompoundNumericInput
              min={0}
              max={1}
              step={0.01}
              value={audioComponent.coneOuterGain}
              onChange={(v) => updateProperty(AudioComponent, 'coneOuterGain', v)}
            />
          </InputGroup>
        </>
      )}
    </>
  )
}

export default AudioSourceProperties
