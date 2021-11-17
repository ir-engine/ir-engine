import React from 'react'
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
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

//declaring properties for ParticleEmitterNodeEditor
type ParticleEmitterNodeEditorProps = {
  node: any
}

/**
 * ParticleEmitterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const ParticleEmitterNodeEditor = (props: ParticleEmitterNodeEditorProps) => {
  const { t } = useTranslation()

  //function used to reflect the change in any property of ParticleEmitterNodeEditor
  const updateParticles = () => {
    for (const node of CommandManager.instance.selected) {
      node.updateParticles()
    }
  }

  //function to handle the changes on colorCurve property
  const onChangeColorCurve = (colorCurve) => {
    CommandManager.instance.setPropertyOnSelection('colorCurve', colorCurve)
  }

  //function used to handle the changes velocityCurve property
  const onChangeVelocityCurve = (velocityCurve) => {
    CommandManager.instance.setPropertyOnSelection('velocityCurve', velocityCurve)
  }

  //function used to handle the changes in startColor property
  const onChangeStartColor = (startColor) => {
    CommandManager.instance.setPropertyOnSelection('startColor', startColor)
    updateParticles()
  }

  //function used to handle the chnages in middleColor property
  const onChangeMiddleColor = (middleColor) => {
    CommandManager.instance.setPropertyOnSelection('middleColor', middleColor)
  }

  //function used to handle the changes in endColor property
  const onChangeEndColor = (endColor) => {
    CommandManager.instance.setPropertyOnSelection('endColor', endColor)
  }

  //function used to handle the changes in startOpacity
  const onChangeStartOpacity = (startOpacity) => {
    CommandManager.instance.setPropertyOnSelection('startOpacity', startOpacity)
  }

  //function used to handle the change in middleOpacity
  const onChangeMiddleOpacity = (middleOpacity) => {
    CommandManager.instance.setPropertyOnSelection('middleOpacity', middleOpacity)
  }

  //function used to  handle the changes in endOpacity
  const onChangeEndOpacity = (endOpacity) => {
    CommandManager.instance.setPropertyOnSelection('endOpacity', endOpacity)
  }

  //function to handle the change in src property
  const onChangeSrc = (src) => {
    CommandManager.instance.setPropertyOnSelection('src', src)
  }

  //function used to handle the changes in sizeCurve
  const onChangeSizeCurve = (sizeCurve) => {
    CommandManager.instance.setPropertyOnSelection('sizeCurve', sizeCurve)
  }

  //function used to handle changes in startSize property
  const onChangeStartSize = (startSize) => {
    CommandManager.instance.setPropertyOnSelection('startSize', startSize)
    updateParticles()
  }

  //function used to handle the changes in endSize property
  const onChangeEndSize = (endSize) => {
    CommandManager.instance.setPropertyOnSelection('endSize', endSize)
  }

  //function used to handle the changes in sizeRandomness
  const onChangeSizeRandomness = (sizeRandomness) => {
    CommandManager.instance.setPropertyOnSelection('sizeRandomness', sizeRandomness)
    updateParticles()
  }

  //function used to handle the changes in startVelocity
  const onChangeStartVelocity = (startVelocity) => {
    CommandManager.instance.setPropertyOnSelection('startVelocity', startVelocity)
  }

  //function used to handle the changes in endVelocity
  const onChangeEndVelocity = (endVelocity) => {
    CommandManager.instance.setPropertyOnSelection('endVelocity', endVelocity)
  }

  //function used to handle the changes in angularVelocity
  const onChangeAngularVelocity = (angularVelocity) => {
    CommandManager.instance.setPropertyOnSelection('angularVelocity', angularVelocity)
  }

  // function used to handle the changes in particleCount
  const onChangeParticleCount = (particleCount) => {
    CommandManager.instance.setPropertyOnSelection('particleCount', particleCount)
    updateParticles()
  }

  // function used to handle the changes in lifetime property
  const onChangeLifetime = (lifetime) => {
    CommandManager.instance.setPropertyOnSelection('lifetime', lifetime)
    updateParticles()
  }

  //function to handle the changes in ageRandomness property
  const onChangeAgeRandomness = (ageRandomness) => {
    CommandManager.instance.setPropertyOnSelection('ageRandomness', ageRandomness)
    updateParticles()
  }

  //function to handle the changes on lifetimeRandomness property
  const onChangeLifetimeRandomness = (lifetimeRandomness) => {
    CommandManager.instance.setPropertyOnSelection('lifetimeRandomness', lifetimeRandomness)
    updateParticles()
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.partileEmitter.description')}>
      <NumericInputGroup
        name="Particle Count"
        label={t('editor:properties.partileEmitter.lbl-particleCount')}
        min={1}
        smallStep={1}
        mediumStep={1}
        largeStep={1}
        value={props.node.particleCount}
        onChange={onChangeParticleCount}
      />

      <InputGroup name="Image" label={t('editor:properties.partileEmitter.lbl-image')}>
        <ImageInput value={props.node.src} onChange={onChangeSrc} />
      </InputGroup>

      <NumericInputGroup
        name="Age Randomness"
        label={t('editor:properties.partileEmitter.lbl-ageRandomness')}
        info={t('editor:properties.partileEmitter.info-ageRandomness')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.ageRandomness}
        onChange={onChangeAgeRandomness}
        unit="s"
      />

      <NumericInputGroup
        name="Lifetime"
        label={t('editor:properties.partileEmitter.lbl-lifetime')}
        info={t('editor:properties.partileEmitter.info-lifetime')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.lifetime}
        onChange={onChangeLifetime}
        unit="s"
      />

      <NumericInputGroup
        name="Lifetime Randomness"
        label={t('editor:properties.partileEmitter.lbl-lifetimeRandomness')}
        info={t('editor:properties.partileEmitter.info-lifetimeRandomness')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.lifetimeRandomness}
        onChange={onChangeLifetimeRandomness}
        unit="s"
      />

      <InputGroup name="Size Curve" label={t('editor:properties.partileEmitter.lbl-sizeCurve')}>
        <SelectInput options={CurveOptions} value={props.node.sizeCurve} onChange={onChangeSizeCurve} />
      </InputGroup>

      <NumericInputGroup
        name="Start Particle Size"
        label={t('editor:properties.partileEmitter.lbl-startPSize')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.startSize}
        onChange={onChangeStartSize}
        unit="m"
      />

      <NumericInputGroup
        name="End Particle Size"
        label={t('editor:properties.partileEmitter.lbl-endPSize')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.endSize}
        onChange={onChangeEndSize}
        unit="m"
      />

      <NumericInputGroup
        name="Size Randomness"
        label={t('editor:properties.partileEmitter.lbl-sizeRandomness')}
        info={t('editor:properties.partileEmitter.info-sizeRandomness')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.sizeRandomness}
        onChange={onChangeSizeRandomness}
        unit="m"
      />

      <InputGroup name="Color Curve" label={t('editor:properties.partileEmitter.lbl-colorCurve')}>
        <SelectInput options={CurveOptions} value={props.node.colorCurve} onChange={onChangeColorCurve} />
      </InputGroup>

      <InputGroup name="Start Color" label={t('editor:properties.partileEmitter.lbl-startColor')}>
        <ColorInput value={props.node.startColor} onChange={onChangeStartColor} />
      </InputGroup>

      <InputGroup name="Start Opacity" label={t('editor:properties.partileEmitter.lbl-startOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={props.node.startOpacity}
          onChange={onChangeStartOpacity}
        />
      </InputGroup>

      <InputGroup name="Middle Color" label={t('editor:properties.partileEmitter.lbl-middleColor')}>
        <ColorInput value={props.node.middleColor} onChange={onChangeMiddleColor} />
      </InputGroup>

      <InputGroup name="Middle Opacity" label={t('editor:properties.partileEmitter.lbl-middleOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={props.node.middleOpacity}
          onChange={onChangeMiddleOpacity}
        />
      </InputGroup>

      <InputGroup name="End Color" label={t('editor:properties.partileEmitter.lbl-endColor')}>
        <ColorInput value={props.node.endColor} onChange={onChangeEndColor} />
      </InputGroup>

      <InputGroup name="End Opacity" label={t('editor:properties.partileEmitter.lbl-endOpacity')}>
        <CompoundNumericInput min={0} max={1} step={0.01} value={props.node.endOpacity} onChange={onChangeEndOpacity} />
      </InputGroup>

      <InputGroup name="Velocity Curve" label={t('editor:properties.partileEmitter.lbl-velocityCurve')}>
        <SelectInput options={CurveOptions} value={props.node.velocityCurve} onChange={onChangeVelocityCurve} />
      </InputGroup>

      <InputGroup name="Start Velocity" label={t('editor:properties.partileEmitter.lbl-startVelocity')}>
        <Vector3Input
          value={props.node.startVelocity}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeStartVelocity}
        />
      </InputGroup>

      <InputGroup name="End Velocity" label={t('editor:properties.partileEmitter.lbl-endVelocity')}>
        <Vector3Input
          value={props.node.endVelocity}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeEndVelocity}
        />
      </InputGroup>

      <NumericInputGroup
        name="Angular Velocity"
        label={t('editor:properties.partileEmitter.lbl-angularVelocity')}
        min={-100}
        smallStep={1}
        mediumStep={1}
        largeStep={1}
        value={props.node.angularVelocity}
        onChange={onChangeAngularVelocity}
        unit="°/s"
      />
    </NodeEditor>
  )
}

ParticleEmitterNodeEditor.iconComponent = SprayCan

export default ParticleEmitterNodeEditor
