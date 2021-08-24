import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
import { camelPad } from '@xrengine/editor/src/functions/utils'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

//declaring properties for ParticleEmitterNodeEditor
type ParticleEmitterNodeEditorProps = {
  editor: any
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
  // declaring propTypes for ParticleEmitterNodeEditor
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  }

  constructor(props: ParticleEmitterNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = SprayCan

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.partileEmitter.description')

  props: ParticleEmitterNodeEditorProps

  //function used to reflect the change in any property of ParticleEmitterNodeEditor
  updateParticles() {
    for (const node of this.props.editor.selected) {
      node.updateParticles()
    }
  }

  //function to handle the changes on colorCurve property
  onChangeColorCurve = (colorCurve) => {
    this.props.editor.setPropertySelected('colorCurve', colorCurve)
  }

  //function used to handle the changes velocityCurve property
  onChangeVelocityCurve = (velocityCurve) => {
    this.props.editor.setPropertySelected('velocityCurve', velocityCurve)
  }

  //function used to handle the changes in startColor property
  onChangeStartColor = (startColor) => {
    this.props.editor.setPropertySelected('startColor', startColor)
    this.updateParticles()
  }

  //function used to handle the chnages in middleColor property
  onChangeMiddleColor = (middleColor) => {
    this.props.editor.setPropertySelected('middleColor', middleColor)
  }

  //function used to handle the changes in endColor property
  onChangeEndColor = (endColor) => {
    this.props.editor.setPropertySelected('endColor', endColor)
  }

  //function used to handle the changes in startOpacity
  onChangeStartOpacity = (startOpacity) => {
    this.props.editor.setPropertySelected('startOpacity', startOpacity)
  }

  //function used to handle the change in middleOpacity
  onChangeMiddleOpacity = (middleOpacity) => {
    this.props.editor.setPropertySelected('middleOpacity', middleOpacity)
  }

  //function used to  handle the changes in endOpacity
  onChangeEndOpacity = (endOpacity) => {
    this.props.editor.setPropertySelected('endOpacity', endOpacity)
  }

  //function to handle the change in src property
  onChangeSrc = (src) => {
    this.props.editor.setPropertySelected('src', src)
  }

  //function used to handle the changes in sizeCurve
  onChangeSizeCurve = (sizeCurve) => {
    this.props.editor.setPropertySelected('sizeCurve', sizeCurve)
  }

  //function used to handle changes in startSize property
  onChangeStartSize = (startSize) => {
    this.props.editor.setPropertySelected('startSize', startSize)
    this.updateParticles()
  }

  //function used to handle the changes in endSize property
  onChangeEndSize = (endSize) => {
    this.props.editor.setPropertySelected('endSize', endSize)
  }

  //function used to handle the changes in sizeRandomness
  onChangeSizeRandomness = (sizeRandomness) => {
    this.props.editor.setPropertySelected('sizeRandomness', sizeRandomness)
    this.updateParticles()
  }

  //function used to handle the changes in startVelocity
  onChangeStartVelocity = (startVelocity) => {
    this.props.editor.setPropertySelected('startVelocity', startVelocity)
  }

  //function used to handle the changes in endVelocity
  onChangeEndVelocity = (endVelocity) => {
    this.props.editor.setPropertySelected('endVelocity', endVelocity)
  }

  //function used to handle the changes in angularVelocity
  onChangeAngularVelocity = (angularVelocity) => {
    this.props.editor.setPropertySelected('angularVelocity', angularVelocity)
  }

  // function used to handle the changes in particleCount
  onChangeParticleCount = (particleCount) => {
    this.props.editor.setPropertySelected('particleCount', particleCount)
    this.updateParticles()
  }

  // function used to handle the changes in lifetime property
  onChangeLifetime = (lifetime) => {
    this.props.editor.setPropertySelected('lifetime', lifetime)
    this.updateParticles()
  }

  //function to handle the changes in ageRandomness property
  onChangeAgeRandomness = (ageRandomness) => {
    this.props.editor.setPropertySelected('ageRandomness', ageRandomness)
    this.updateParticles()
  }

  //function to handle the changes on lifetimeRandomness property
  onChangeLifetimeRandomness = (lifetimeRandomness) => {
    this.props.editor.setPropertySelected('lifetimeRandomness', lifetimeRandomness)
    this.updateParticles()
  }

  //rendering view for ParticleEmitterNodeEditor
  render() {
    ParticleEmitterNodeEditor.description = this.props.t('editor:properties.partileEmitter.description')
    return (
      <NodeEditor {...this.props} description={ParticleEmitterNodeEditor.description}>
        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
        <InputGroup name="Image" label={this.props.t('editor:properties.partileEmitter.lbl-image')}>
          <ImageInput value={this.props.node.src} onChange={this.onChangeSrc} />
        </InputGroup>

        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
        <InputGroup name="Size Curve" label={this.props.t('editor:properties.partileEmitter.lbl-sizeCurve')}>
          {/* @ts-ignore */}
          <SelectInput options={CurveOptions} value={this.props.node.sizeCurve} onChange={this.onChangeSizeCurve} />
        </InputGroup>

        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
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

        {/* @ts-ignore */}
        <InputGroup name="Color Curve" label={this.props.t('editor:properties.partileEmitter.lbl-colorCurve')}>
          {/* @ts-ignore */}
          <SelectInput options={CurveOptions} value={this.props.node.colorCurve} onChange={this.onChangeColorCurve} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Start Color" label={this.props.t('editor:properties.partileEmitter.lbl-startColor')}>
          {/* @ts-ignore */}
          <ColorInput value={this.props.node.startColor} onChange={this.onChangeStartColor} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Start Opacity" label={this.props.t('editor:properties.partileEmitter.lbl-startOpacity')}>
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={this.props.node.startOpacity}
            onChange={this.onChangeStartOpacity}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Middle Color" label={this.props.t('editor:properties.partileEmitter.lbl-middleColor')}>
          {/* @ts-ignore */}
          <ColorInput value={this.props.node.middleColor} onChange={this.onChangeMiddleColor} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Middle Opacity" label={this.props.t('editor:properties.partileEmitter.lbl-middleOpacity')}>
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={this.props.node.middleOpacity}
            onChange={this.onChangeMiddleOpacity}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="End Color" label={this.props.t('editor:properties.partileEmitter.lbl-endColor')}>
          {/* @ts-ignore */}
          <ColorInput value={this.props.node.endColor} onChange={this.onChangeEndColor} />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="End Opacity" label={this.props.t('editor:properties.partileEmitter.lbl-endOpacity')}>
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.01}
            value={this.props.node.endOpacity}
            onChange={this.onChangeEndOpacity}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Velocity Curve" label={this.props.t('editor:properties.partileEmitter.lbl-velocityCurve')}>
          {/* @ts-ignore */}
          <SelectInput
            options={CurveOptions}
            value={this.props.node.velocityCurve}
            onChange={this.onChangeVelocityCurve}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="Start Velocity" label={this.props.t('editor:properties.partileEmitter.lbl-startVelocity')}>
          <Vector3Input
            value={this.props.node.startVelocity}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeStartVelocity}
          />
        </InputGroup>

        {/* @ts-ignore */}
        <InputGroup name="End Velocity" label={this.props.t('editor:properties.partileEmitter.lbl-endVelocity')}>
          <Vector3Input
            value={this.props.node.endVelocity}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={1}
            onChange={this.onChangeEndVelocity}
          />
        </InputGroup>

        {/* @ts-ignore */}
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
