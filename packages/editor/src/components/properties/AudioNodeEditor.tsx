import React from 'react'
import { useTranslation } from 'react-i18next'

import { PositionalAudioComponent } from '@xrengine/engine/src/audio/components/PositionalAudioComponent'
import { AudioType, DistanceModel, DistanceModelOptions } from '@xrengine/engine/src/audio/constants/AudioConstants'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useHookstate } from '@xrengine/hyperflux'

import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const AudioTypeOptions = [
  { label: AudioType.Stereo, value: AudioType.Stereo },
  { label: AudioType.Positional, value: AudioType.Positional }
]

/**
 * AudioNodeEditor used to customize audio element on the scene.
 *
 * @param       {Object} props
 * @constructor
 */
export const AudioNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const audioComponent = useHookstate(getComponent(props.node.entity, PositionalAudioComponent)).value

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.audio.name')}
      description={t('editor:properties.audio.description')}
    >
      <InputGroup
        name="Distance Model"
        label={t('editor:properties.audio.lbl-distanceModel')}
        info={t('editor:properties.audio.info-distanceModel')}
      >
        <SelectInput
          key={props.node.entity}
          options={DistanceModelOptions}
          value={audioComponent.distanceModel}
          onChange={updateProperty(PositionalAudioComponent, 'distanceModel')}
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
            onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
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
          onChange={updateProperty(PositionalAudioComponent, 'rolloffFactor')}
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
        onChange={updateProperty(PositionalAudioComponent, 'refDistance')}
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
        onChange={updateProperty(PositionalAudioComponent, 'maxDistance')}
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
        onChange={updateProperty(PositionalAudioComponent, 'coneInnerAngle')}
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
        onChange={updateProperty(PositionalAudioComponent, 'coneOuterAngle')}
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
          onChange={updateProperty(PositionalAudioComponent, 'coneOuterGain')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

//setting icon component name
AudioNodeEditor.iconComponent = VolumeUpIcon

export default AudioNodeEditor
