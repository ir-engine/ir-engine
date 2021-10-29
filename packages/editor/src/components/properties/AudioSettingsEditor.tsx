import React, { useState, useCallback } from 'react'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { withTranslation } from 'react-i18next'
import { AudioSettingsComponent } from '@xrengine/engine/src/scene/components/AudioSettingsComponent'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import { DistanceModelOptions, DistanceModelType } from '@xrengine/engine/src/scene/classes/AudioSource'

export const AudioSettingsEditor = (node: any, t: Function) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onChangeUserPositionalAudio = (usePositionalAudio) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.usePositionalAudio = usePositionalAudio
    forceUpdate()
  }

  const onChangeAvatarDistanceModel = (avatarDistanceModel) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarDistanceModel = avatarDistanceModel
    forceUpdate()
  }

  const onChangeAvatarRolloffFactor = (avatarRolloffFactor) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarRolloffFactor = avatarRolloffFactor
    forceUpdate()
  }

  const onChangeAvatarRefDistance = (avatarRefDistance) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarRefDistance = avatarRefDistance
    forceUpdate()
  }

  const onChangeAvatarMaxDistance = (avatarMaxDistance) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarMaxDistance = avatarMaxDistance
    forceUpdate()
  }

  const onChangeMediaVolume = (mediaVolume) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaVolume = mediaVolume
    forceUpdate()
  }

  const onChangeMediaDistanceModel = (mediaDistanceModel) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaDistanceModel = mediaDistanceModel
    forceUpdate()
  }

  const onChangeMediaRolloffFactor = (mediaRolloffFactor) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaRolloffFactor = mediaRolloffFactor
    forceUpdate()
  }

  const onChangeMediaRefDistance = (mediaRefDistance) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaRefDistance = mediaRefDistance
    forceUpdate()
  }

  const onChangeMediaMaxDistance = (mediaMaxDistance) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaMaxDistance = mediaMaxDistance
    forceUpdate()
  }

  const onChangeMediaConeInnerAngle = (mediaConeInnerAngle) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaConeInnerAngle = mediaConeInnerAngle
    forceUpdate()
  }

  const onChangeMediaConeOuterAngle = (mediaConeOuterAngle) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaConeOuterAngle = mediaConeOuterAngle
    forceUpdate()
  }

  const onChangeMediaConeOuterGain = (mediaConeOuterGain) => {
    const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaConeOuterGain = mediaConeOuterGain
    forceUpdate()
  }

  const audioSettingsComponent = getComponent(node.eid, AudioSettingsComponent)

  return (
    <NodeEditor node={node}>
      <InputGroup name="Override Audio Settings" label={t('editor:properties.scene.lbl-audioSettings')}>
        <BooleanInput value={audioSettingsComponent.usePositionalAudio} onChange={onChangeUserPositionalAudio} />
      </InputGroup>
      {audioSettingsComponent.usePositionalAudio && (
        <>
          <InputGroup
            name="Avatar Distance Model"
            label={t('editor:properties.scene.lbl-avatarDistanceModel')}
            info={t('editor:properties.scene.info-avatarDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioSettingsComponent.avatarDistanceModel}
              onChange={onChangeAvatarDistanceModel}
            />
          </InputGroup>

          {audioSettingsComponent.avatarDistanceModel === DistanceModelType.Linear ? (
            <InputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={audioSettingsComponent.avatarRolloffFactor}
                onChange={onChangeAvatarRolloffFactor}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Avatar Rolloff Factor"
              label={t('editor:properties.scene.lbl-avatarRolloffFactor')}
              info={t('editor:properties.scene.info-avatarRolloffFactorInifinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.avatarRolloffFactor}
              onChange={onChangeAvatarRolloffFactor}
            />
          )}
          <NumericInputGroup
            name="Avatar Ref Distance"
            label={t('editor:properties.scene.lbl-avatarRefDistance')}
            info={t('editor:properties.scene.info-avatarRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioSettingsComponent.avatarRefDistance}
            onChange={onChangeAvatarRefDistance}
            unit="m"
          />
          <NumericInputGroup
            name="Avatar Max Distance"
            label={t('editor:properties.scene.lbl-avatarMaxDistance')}
            info={t('editor:properties.scene.info-avatarMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioSettingsComponent.avatarMaxDistance}
            onChange={onChangeAvatarMaxDistance}
            unit="m"
          />
          <InputGroup name="Media Volume" label={t('editor:properties.scene.lbl-mediaVolume')}>
            <CompoundNumericInput value={audioSettingsComponent.mediaVolume} onChange={onChangeMediaVolume} />
          </InputGroup>
          <InputGroup
            name="Media Distance Model"
            label={t('editor:properties.scene.lbl-mediaDistanceModel')}
            info={t('editor:properties.scene.info-mediaDistanceModel')}
          >
            <SelectInput
              options={DistanceModelOptions}
              value={audioSettingsComponent.mediaDistanceModel}
              onChange={onChangeMediaDistanceModel}
            />
          </InputGroup>

          {audioSettingsComponent.mediaDistanceModel === DistanceModelType.Linear ? (
            <InputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactor')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                smallStep={0.001}
                mediumStep={0.01}
                largeStep={0.1}
                value={audioSettingsComponent.mediaRolloffFactor}
                onChange={onChangeMediaRolloffFactor}
              />
            </InputGroup>
          ) : (
            <NumericInputGroup
              name="Media Rolloff Factor"
              label={t('editor:properties.scene.lbl-mediaRolloffFactor')}
              info={t('editor:properties.scene.info-mediaRolloffFactorInfinity')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.mediaRolloffFactor}
              onChange={onChangeMediaRolloffFactor}
            />
          )}
          <NumericInputGroup
            name="Media Ref Distance"
            label={t('editor:properties.scene.lbl-mediaRefDistance')}
            info={t('editor:properties.scene.info-mediaRefDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioSettingsComponent.mediaRefDistance}
            onChange={onChangeMediaRefDistance}
            unit="m"
          />
          <NumericInputGroup
            name="Media Max Distance"
            label={t('editor:properties.scene.lbl-mediaMaxDistance')}
            info={t('editor:properties.scene.info-mediaMaxDistance')}
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioSettingsComponent.mediaMaxDistance}
            onChange={onChangeMediaMaxDistance}
            unit="m"
          />
          <NumericInputGroup
            name="Media Cone Inner Angle"
            label={t('editor:properties.scene.lbl-mediaConeInnerAngle')}
            info={t('editor:properties.scene.info-mediaConeInnerAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioSettingsComponent.mediaConeInnerAngle}
            onChange={onChangeMediaConeInnerAngle}
            unit="°"
          />
          <NumericInputGroup
            name="Media Cone Outer Angle"
            label={t('editor:properties.scene.lbl-mediaConeOuterAngle')}
            info={t('editor:properties.scene.info-mediaConeOuterAngle')}
            min={0}
            max={360}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={audioSettingsComponent.mediaConeOuterAngle}
            onChange={onChangeMediaConeOuterAngle}
            unit="°"
          />
          <InputGroup
            name="Media Cone Outer Gain"
            label={t('editor:properties.scene.lbl-mediaConeOuterGain')}
            info={t('editor:properties.scene.info-mediaConeOuterGain')}
          >
            <CompoundNumericInput
              min={0}
              max={1}
              step={0.01}
              value={audioSettingsComponent.mediaConeOuterGain}
              onChange={onChangeMediaConeOuterGain}
            />
          </InputGroup>
        </>
      )}
    </NodeEditor>
  )
}

export default withTranslation()(AudioSettingsEditor)
