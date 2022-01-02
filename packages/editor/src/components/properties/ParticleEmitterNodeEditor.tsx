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
import { camelPad } from '../../functions/utils'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import GrainIcon from '@mui/icons-material/Grain'
import { ParticleEmitterComponent } from '@xrengine/engine/src/particles/components/ParticleEmitter'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

//declaring properties for ParticleEmitterNodeEditor
type ParticleEmitterNodeEditorProps = {
  node: any
}

export const ParticleEmitterNodeEditor = (props: ParticleEmitterNodeEditorProps) => {
  const { t } = useTranslation()

  const onChangeValue = (prop) => (value) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: ParticleEmitterComponent,
      properties: { [prop]: value }
    })
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
        onChange={onChangeValue('particleCount')}
      />

      <InputGroup name="Image" label={t('editor:properties.partileEmitter.lbl-image')}>
        <ImageInput value={props.node.src} onChange={onChangeValue('src')} />
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
        onChange={onChangeValue('ageRandomness')}
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
        onChange={onChangeValue('lifetime')}
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
        onChange={onChangeValue('lifetimeRandomness')}
        unit="s"
      />

      <InputGroup name="Size Curve" label={t('editor:properties.partileEmitter.lbl-sizeCurve')}>
        <SelectInput options={CurveOptions} value={props.node.sizeCurve} onChange={onChangeValue('sizeCurve')} />
      </InputGroup>

      <NumericInputGroup
        name="Start Particle Size"
        label={t('editor:properties.partileEmitter.lbl-startPSize')}
        min={0}
        smallStep={0.01}
        mediumStep={0.1}
        largeStep={1}
        value={props.node.startSize}
        onChange={onChangeValue('startSize')}
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
        onChange={onChangeValue('endSize')}
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
        onChange={onChangeValue('sizeRandomness')}
        unit="m"
      />

      <InputGroup name="Color Curve" label={t('editor:properties.partileEmitter.lbl-colorCurve')}>
        <SelectInput options={CurveOptions} value={props.node.colorCurve} onChange={onChangeValue('colorCurve')} />
      </InputGroup>

      <InputGroup name="Start Color" label={t('editor:properties.partileEmitter.lbl-startColor')}>
        <ColorInput value={props.node.startColor} onChange={onChangeValue('startColor')} />
      </InputGroup>

      <InputGroup name="Start Opacity" label={t('editor:properties.partileEmitter.lbl-startOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={props.node.startOpacity}
          onChange={onChangeValue('startOpacity')}
        />
      </InputGroup>

      <InputGroup name="Middle Color" label={t('editor:properties.partileEmitter.lbl-middleColor')}>
        <ColorInput value={props.node.middleColor} onChange={onChangeValue('middleColor')} />
      </InputGroup>

      <InputGroup name="Middle Opacity" label={t('editor:properties.partileEmitter.lbl-middleOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={props.node.middleOpacity}
          onChange={onChangeValue('middleOpacity')}
        />
      </InputGroup>

      <InputGroup name="End Color" label={t('editor:properties.partileEmitter.lbl-endColor')}>
        <ColorInput value={props.node.endColor} onChange={onChangeValue('endColor')} />
      </InputGroup>

      <InputGroup name="End Opacity" label={t('editor:properties.partileEmitter.lbl-endOpacity')}>
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.01}
          value={props.node.endOpacity}
          onChange={onChangeValue('endOpacity')}
        />
      </InputGroup>

      <InputGroup name="Velocity Curve" label={t('editor:properties.partileEmitter.lbl-velocityCurve')}>
        <SelectInput
          options={CurveOptions}
          value={props.node.velocityCurve}
          onChange={onChangeValue('velocityCurve')}
        />
      </InputGroup>

      <InputGroup name="Start Velocity" label={t('editor:properties.partileEmitter.lbl-startVelocity')}>
        <Vector3Input
          value={props.node.startVelocity}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeValue('startVelocity')}
        />
      </InputGroup>

      <InputGroup name="End Velocity" label={t('editor:properties.partileEmitter.lbl-endVelocity')}>
        <Vector3Input
          value={props.node.endVelocity}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          onChange={onChangeValue('endVelocity')}
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
        onChange={onChangeValue('angularVelocity')}
        unit="°/s"
      />
    </NodeEditor>
  )
}

ParticleEmitterNodeEditor.iconComponent = GrainIcon

export default ParticleEmitterNodeEditor
