import React from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import { EditorComponentType, updateProperty } from './Util'
import { useTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { AudioType, DistanceModel, DistanceModelOptions } from '@xrengine/engine/src/audio/constants/AudioConstants'

const AudioTypeOptions = [
  { label: AudioType.Stereo, value: AudioType.Stereo },
  { label: AudioType.Positional, value: AudioType.Positional }
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
  const { t } = useTranslation()

  const audioComponent = getComponent(props.node.entity, AudioComponent)

  return (
    <>
      <InputGroup name="Audio Type" label={t('editor:properties.audio.lbl-audioType')}>
        <SelectInput
          options={AudioTypeOptions}
          value={audioComponent.audioType}
          onChange={updateProperty(AudioComponent, 'audioType')}
        />
      </InputGroup>
      <InputGroup name="Volume" label={t('editor:properties.audio.lbl-volume')}>
        <CompoundNumericInput value={audioComponent.volume} onChange={updateProperty(AudioComponent, 'volume')} />
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
              onChange={updateProperty(AudioComponent, 'distanceModel')}
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
                onChange={updateProperty(AudioComponent, 'rolloffFactor')}
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
              onChange={updateProperty(AudioComponent, 'rolloffFactor')}
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
            onChange={updateProperty(AudioComponent, 'refDistance')}
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
            onChange={updateProperty(AudioComponent, 'maxDistance')}
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
            onChange={updateProperty(AudioComponent, 'coneInnerAngle')}
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
            onChange={updateProperty(AudioComponent, 'coneOuterAngle')}
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
              onChange={updateProperty(AudioComponent, 'coneOuterGain')}
            />
          </InputGroup>
        </>
      )}
    </>
  )
}

export default AudioSourceProperties
