import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import Vector3Input from '../inputs/Vector3Input'
import SelectInput from '../inputs/SelectInput'
import * as EasingFunctions from '@xrengine/engine/src/common/functions/EasingFunctions'
import { SprayCan } from '@styled-icons/fa-solid/SprayCan'
import { camelPad } from '../../functions/utils'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

//declaring properties for ParticleEmitterNodeEditor
type ParticleEmitterNodeEditorProps = {
  node: any
  t: Function
}

/**
 * ParticleEmitterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class ParticleEmitterNodeEditor extends Component<ParticleEmitterNodeEditorProps> {
  declare props: ParticleEmitterNodeEditorProps
  constructor(props: ParticleEmitterNodeEditorProps) {
    super(props)
  }

  //setting iconComponent name
  static iconComponent = SprayCan

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.partileEmitter.description')

  //function used to reflect the change in any property of ParticleEmitterNodeEditor
  updateParticles() {
    for (const node of CommandManager.instance.selected) {
      node.updateParticles()
    }
  }

  //function to handle the changes on colorCurve property
  onChangeColorCurve = (colorCurve) => {
    CommandManager.instance.setPropertyOnSelection('colorCurve', colorCurve)
  }

  //function used to handle the changes velocityCurve property
  onChangeVelocityCurve = (velocityCurve) => {
    CommandManager.instance.setPropertyOnSelection('velocityCurve', velocityCurve)
  }

  //function used to handle the changes in startColor property
  onChangeStartColor = (startColor) => {
    CommandManager.instance.setPropertyOnSelection('startColor', startColor)
    this.updateParticles()
  }

  //function used to handle the chnages in middleColor property
  onChangeMiddleColor = (middleColor) => {
    CommandManager.instance.setPropertyOnSelection('middleColor', middleColor)
  }

  //function used to handle the changes in endColor property
  onChangeEndColor = (endColor) => {
    CommandManager.instance.setPropertyOnSelection('endColor', endColor)
  }

  //function used to handle the changes in startOpacity
  onChangeStartOpacity = (startOpacity) => {
    CommandManager.instance.setPropertyOnSelection('startOpacity', startOpacity)
  }

  //function used to handle the change in middleOpacity
  onChangeMiddleOpacity = (middleOpacity) => {
    CommandManager.instance.setPropertyOnSelection('middleOpacity', middleOpacity)
  }

  //function used to  handle the changes in endOpacity
  onChangeEndOpacity = (endOpacity) => {
    CommandManager.instance.setPropertyOnSelection('endOpacity', endOpacity)
  }

  //function to handle the change in src property
  onChangeSrc = (src) => {
    CommandManager.instance.setPropertyOnSelection('src', src)
  }

  //function used to handle the changes in sizeCurve
  onChangeSizeCurve = (sizeCurve) => {
    CommandManager.instance.setPropertyOnSelection('sizeCurve', sizeCurve)
  }

  //function used to handle changes in startSize property
  onChangeStartSize = (startSize) => {
    CommandManager.instance.setPropertyOnSelection('startSize', startSize)
    this.updateParticles()
  }

  //function used to handle the changes in endSize property
  onChangeEndSize = (endSize) => {
    CommandManager.instance.setPropertyOnSelection('endSize', endSize)
  }

  //function used to handle the changes in sizeRandomness
  onChangeSizeRandomness = (sizeRandomness) => {
    CommandManager.instance.setPropertyOnSelection('sizeRandomness', sizeRandomness)
    this.updateParticles()
  }

  //function used to handle the changes in startVelocity
  onChangeStartVelocity = (startVelocity) => {
    CommandManager.instance.setPropertyOnSelection('startVelocity', startVelocity)
  }

  //function used to handle the changes in endVelocity
  onChangeEndVelocity = (endVelocity) => {
    CommandManager.instance.setPropertyOnSelection('endVelocity', endVelocity)
  }

  //function used to handle the changes in angularVelocity
  onChangeAngularVelocity = (angularVelocity) => {
    CommandManager.instance.setPropertyOnSelection('angularVelocity', angularVelocity)
  }

  // function used to handle the changes in particleCount
  onChangeParticleCount = (particleCount) => {
    CommandManager.instance.setPropertyOnSelection('particleCount', particleCount)
    this.updateParticles()
  }

  // function used to handle the changes in lifetime property
  onChangeLifetime = (lifetime) => {
    CommandManager.instance.setPropertyOnSelection('lifetime', lifetime)
    this.updateParticles()
  }

  //function to handle the changes in ageRandomness property
  onChangeAgeRandomness = (ageRandomness) => {
    CommandManager.instance.setPropertyOnSelection('ageRandomness', ageRandomness)
    this.updateParticles()
  }

  //function to handle the changes on lifetimeRandomness property
  onChangeLifetimeRandomness = (lifetimeRandomness) => {
    CommandManager.instance.setPropertyOnSelection('lifetimeRandomness', lifetimeRandomness)
    this.updateParticles()
  }

  //rendering view for ParticleEmitterNodeEditor
  render() {
    ParticleEmitterNodeEditor.description = this.props.t('editor:properties.partileEmitter.description')
    return (
      <NodeEditor {...this.props} description={ParticleEmitterNodeEditor.description}>
        <NumericInputGroup
          name="Particle Count"
          label={this.props.t('editor:properties.partileEmitter.lbl-particleCount')}
          min={1}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          value={this.props.node.particleCount}
          onChange={this.onChangeParticleCount}
        />

        <InputGroup name="Image" label={this.props.t('editor:properties.partileEmitter.lbl-image')}>
          <ImageInput value={this.props.node.src} onChange={this.onChangeSrc} />
        </InputGroup>

        <NumericInputGroup
          name="Age Randomness"
          label={this.props.t('editor:properties.partileEmitter.lbl-ageRandomness')}
          info={this.props.t('editor:properties.partileEmitter.info-ageRandomness')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={this.props.node.ageRandomness}
          onChange={this.onChangeAgeRandomness}
          unit="s"
        />

        <NumericInputGroup
          name="Lifetime"
          label={this.props.t('editor:properties.partileEmitter.lbl-lifetime')}
          info={this.props.t('editor:properties.partileEmitter.info-lifetime')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={this.props.node.lifetime}
          onChange={this.onChangeLifetime}
          unit="s"
        />

        <NumericInputGroup
          name="Lifetime Randomness"
          label={this.props.t('editor:properties.partileEmitter.lbl-lifetimeRandomness')}
          info={this.props.t('editor:properties.partileEmitter.info-lifetimeRandomness')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={this.props.node.lifetimeRandomness}
          onChange={this.onChangeLifetimeRandomness}
          unit="s"
        />

        <InputGroup name="Size Curve" label={this.props.t('editor:properties.partileEmitter.lbl-sizeCurve')}>
          <SelectInput options={CurveOptions} value={this.props.node.sizeCurve} onChange={this.onChangeSizeCurve} />
        </InputGroup>

        <NumericInputGroup
          name="Start Particle Size"
          label={this.props.t('editor:properties.partileEmitter.lbl-startPSize')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={this.props.node.startSize}
          onChange={this.onChangeStartSize}
          unit="m"
        />

        <NumericInputGroup
          name="End Particle Size"
          label={this.props.t('editor:properties.partileEmitter.lbl-endPSize')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={this.props.node.endSize}
          onChange={this.onChangeEndSize}
          unit="m"
        />

        <NumericInputGroup
          name="Size Randomness"
          label={this.props.t('editor:properties.partileEmitter.lbl-sizeRandomness')}
          info={this.props.t('editor:properties.partileEmitter.info-sizeRandomness')}
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={this.props.node.sizeRandomness}
          onChange={this.onChangeSizeRandomness}
          unit="m"
        />

        <InputGroup name="Color Curve" label={this.props.t('editor:properties.partileEmitter.lbl-colorCurve')}>
          <SelectInput options={CurveOptions} value={this.props.node.colorCurve} onChange={this.onChangeColorCurve} />
        </InputGroup>

        <InputGroup name="Start Color" label={this.props.t('editor:properties.partileEmitter.lbl-startColor')}>
          <ColorInput value={this.props.node.startColor} onChange={this.onChangeStartColor} />
        </InputGroup>

        <InputGroup name="Start Opacity" label={this.props.t('editor:properties.partileEmitter.lbl-startOpacity')}>
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={this.props.node.startOpacity}
            onChange={this.onChangeStartOpacity}
          />
        </InputGroup>

        <InputGroup name="Middle Color" label={this.props.t('editor:properties.partileEmitter.lbl-middleColor')}>
          <ColorInput value={this.props.node.middleColor} onChange={this.onChangeMiddleColor} />
        </InputGroup>

        <InputGroup name="Middle Opacity" label={this.props.t('editor:properties.partileEmitter.lbl-middleOpacity')}>
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={this.props.node.middleOpacity}
            onChange={this.onChangeMiddleOpacity}
          />
        </InputGroup>

        <InputGroup name="End Color" label={this.props.t('editor:properties.partileEmitter.lbl-endColor')}>
          <ColorInput value={this.props.node.endColor} onChange={this.onChangeEndColor} />
        </InputGroup>

        <InputGroup name="End Opacity" label={this.props.t('editor:properties.partileEmitter.lbl-endOpacity')}>
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={this.props.node.endOpacity}
            onChange={this.onChangeEndOpacity}
          />
        </InputGroup>

        <InputGroup name="Velocity Curve" label={this.props.t('editor:properties.partileEmitter.lbl-velocityCurve')}>
          <SelectInput
            options={CurveOptions}
            value={this.props.node.velocityCurve}
            onChange={this.onChangeVelocityCurve}
          />
        </InputGroup>

        <InputGroup name="Start Velocity" label={this.props.t('editor:properties.partileEmitter.lbl-startVelocity')}>
          <Vector3Input
            value={this.props.node.startVelocity}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeStartVelocity}
          />
        </InputGroup>

        <InputGroup name="End Velocity" label={this.props.t('editor:properties.partileEmitter.lbl-endVelocity')}>
          <Vector3Input
            value={this.props.node.endVelocity}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeEndVelocity}
          />
        </InputGroup>

        <NumericInputGroup
          name="Angular Velocity"
          label={this.props.t('editor:properties.partileEmitter.lbl-angularVelocity')}
          min={-100}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          value={this.props.node.angularVelocity}
          onChange={this.onChangeAngularVelocity}
          unit="°/s"
        />
      </NodeEditor>
    )
  }
}

export default withTranslation()(ParticleEmitterNodeEditor)
