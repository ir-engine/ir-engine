import React from 'react'
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


/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @author Robert Long
 * @param       props
 * @constructor
 */
export class AudioSettingsEditor extends React.Component<{node: any, t: Function}> {
  onChangeUserPositionalAudio = (usePositionalAudio) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.usePositionalAudio = usePositionalAudio
    this.forceUpdate()
  }

  onChangeAvatarDistanceModel = (avatarDistanceModel) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarDistanceModel = avatarDistanceModel
    this.forceUpdate()
  }

  onChangeAvatarRolloffFactor = (avatarRolloffFactor) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarRolloffFactor = avatarRolloffFactor
    this.forceUpdate()
  }

  onChangeAvatarRefDistance = (avatarRefDistance) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarRefDistance = avatarRefDistance
    this.forceUpdate()
  }

  onChangeAvatarMaxDistance = (avatarMaxDistance) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.avatarMaxDistance = avatarMaxDistance
    this.forceUpdate()
  }

  onChangeMediaVolume = (mediaVolume) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaVolume = mediaVolume
    this.forceUpdate()
  }

  onChangeMediaDistanceModel = (mediaDistanceModel) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaDistanceModel = mediaDistanceModel
    this.forceUpdate()
  }

  onChangeMediaRolloffFactor = (mediaRolloffFactor) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaRolloffFactor = mediaRolloffFactor
    this.forceUpdate()
  }

  onChangeMediaRefDistance = (mediaRefDistance) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaRefDistance = mediaRefDistance
    this.forceUpdate()
  }

  onChangeMediaMaxDistance = (mediaMaxDistance) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaMaxDistance = mediaMaxDistance
    this.forceUpdate()
  }

  onChangeMediaConeInnerAngle = (mediaConeInnerAngle) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaConeInnerAngle = mediaConeInnerAngle
    this.forceUpdate()
  }

  onChangeMediaConeOuterAngle = (mediaConeOuterAngle) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaConeOuterAngle = mediaConeOuterAngle
    this.forceUpdate()
  }

  onChangeMediaConeOuterGain = (mediaConeOuterGain) => {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)
    audioSettingsComponent.mediaConeOuterGain = mediaConeOuterGain
    this.forceUpdate()
  }

  render() {
    const audioSettingsComponent = getComponent(this.props.node.eid, AudioSettingsComponent)

    return (
      <NodeEditor {...this.props}>
        <InputGroup name="Override Audio Settings" label={this.props.t('editor:properties.scene.lbl-audioSettings')}>
          <BooleanInput value={audioSettingsComponent.usePositionalAudio} onChange={this.onChangeUserPositionalAudio} />
        </InputGroup>
        {audioSettingsComponent.usePositionalAudio && (
          <>
            <InputGroup
              name="Avatar Distance Model"
              label={this.props.t('editor:properties.scene.lbl-avatarDistanceModel')}
              info={this.props.t('editor:properties.scene.info-avatarDistanceModel')}
            >
              <SelectInput
                options={DistanceModelOptions}
                value={audioSettingsComponent.avatarDistanceModel}
                onChange={this.onChangeAvatarDistanceModel}
              />
            </InputGroup>

            {audioSettingsComponent.avatarDistanceModel === DistanceModelType.Linear ? (
              <InputGroup
                name="Avatar Rolloff Factor"
                label={this.props.t('editor:properties.scene.lbl-avatarRolloffFactor')}
                info={this.props.t('editor:properties.scene.info-avatarRolloffFactor')}
              >
                <CompoundNumericInput
                  min={0}
                  max={1}
                  smallStep={0.001}
                  mediumStep={0.01}
                  largeStep={0.1}
                  value={audioSettingsComponent.avatarRolloffFactor}
                  onChange={this.onChangeAvatarRolloffFactor}
                />
              </InputGroup>
            ) : (
              <NumericInputGroup
                name="Avatar Rolloff Factor"
                label={this.props.t('editor:properties.scene.lbl-avatarRolloffFactor')}
                info={this.props.t('editor:properties.scene.info-avatarRolloffFactorInifinity')}
                min={0}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={audioSettingsComponent.avatarRolloffFactor}
                onChange={this.onChangeAvatarRolloffFactor}
              />
            )}
            <NumericInputGroup
              name="Avatar Ref Distance"
              label={this.props.t('editor:properties.scene.lbl-avatarRefDistance')}
              info={this.props.t('editor:properties.scene.info-avatarRefDistance')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.avatarRefDistance}
              onChange={this.onChangeAvatarRefDistance}
              unit="m"
            />
            <NumericInputGroup
              name="Avatar Max Distance"
              label={this.props.t('editor:properties.scene.lbl-avatarMaxDistance')}
              info={this.props.t('editor:properties.scene.info-avatarMaxDistance')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.avatarMaxDistance}
              onChange={this.onChangeAvatarMaxDistance}
              unit="m"
            />
            <InputGroup name="Media Volume" label={this.props.t('editor:properties.scene.lbl-mediaVolume')}>
              <CompoundNumericInput value={audioSettingsComponent.mediaVolume} onChange={this.onChangeMediaVolume} />
            </InputGroup>
            <InputGroup
              name="Media Distance Model"
              label={this.props.t('editor:properties.scene.lbl-mediaDistanceModel')}
              info={this.props.t('editor:properties.scene.info-mediaDistanceModel')}
            >
              <SelectInput
                options={DistanceModelOptions}
                value={audioSettingsComponent.mediaDistanceModel}
                onChange={this.onChangeMediaDistanceModel}
              />
            </InputGroup>

            {audioSettingsComponent.mediaDistanceModel === DistanceModelType.Linear ? (
              <InputGroup
                name="Media Rolloff Factor"
                label={this.props.t('editor:properties.scene.lbl-mediaRolloffFactor')}
                info={this.props.t('editor:properties.scene.info-mediaRolloffFactor')}
              >
                <CompoundNumericInput
                  min={0}
                  max={1}
                  smallStep={0.001}
                  mediumStep={0.01}
                  largeStep={0.1}
                  value={audioSettingsComponent.mediaRolloffFactor}
                  onChange={this.onChangeMediaRolloffFactor}
                />
              </InputGroup>
            ) : (
              <NumericInputGroup
                name="Media Rolloff Factor"
                label={this.props.t('editor:properties.scene.lbl-mediaRolloffFactor')}
                info={this.props.t('editor:properties.scene.info-mediaRolloffFactorInfinity')}
                min={0}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                value={audioSettingsComponent.mediaRolloffFactor}
                onChange={this.onChangeMediaRolloffFactor}
              />
            )}
            <NumericInputGroup
              name="Media Ref Distance"
              label={this.props.t('editor:properties.scene.lbl-mediaRefDistance')}
              info={this.props.t('editor:properties.scene.info-mediaRefDistance')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.mediaRefDistance}
              onChange={this.onChangeMediaRefDistance}
              unit="m"
            />
            <NumericInputGroup
              name="Media Max Distance"
              label={this.props.t('editor:properties.scene.lbl-mediaMaxDistance')}
              info={this.props.t('editor:properties.scene.info-mediaMaxDistance')}
              min={0}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.mediaMaxDistance}
              onChange={this.onChangeMediaMaxDistance}
              unit="m"
            />
            <NumericInputGroup
              name="Media Cone Inner Angle"
              label={this.props.t('editor:properties.scene.lbl-mediaConeInnerAngle')}
              info={this.props.t('editor:properties.scene.info-mediaConeInnerAngle')}
              min={0}
              max={360}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.mediaConeInnerAngle}
              onChange={this.onChangeMediaConeInnerAngle}
              unit="°"
            />
            <NumericInputGroup
              name="Media Cone Outer Angle"
              label={this.props.t('editor:properties.scene.lbl-mediaConeOuterAngle')}
              info={this.props.t('editor:properties.scene.info-mediaConeOuterAngle')}
              min={0}
              max={360}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              value={audioSettingsComponent.mediaConeOuterAngle}
              onChange={this.onChangeMediaConeOuterAngle}
              unit="°"
            />
            <InputGroup
              name="Media Cone Outer Gain"
              label={this.props.t('editor:properties.scene.lbl-mediaConeOuterGain')}
              info={this.props.t('editor:properties.scene.info-mediaConeOuterGain')}
            >
              <CompoundNumericInput
                min={0}
                max={1}
                step={0.01}
                value={audioSettingsComponent.mediaConeOuterGain}
                onChange={this.onChangeMediaConeOuterGain}
              />
            </InputGroup>
          </>
        )}
      </NodeEditor>
    )
  }
}

export default withTranslation()(AudioSettingsEditor)
