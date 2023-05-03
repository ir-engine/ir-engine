import React, { useCallback } from 'react'
import { Vector3 } from 'three'

import {
  ApplyForceBehaviorJSON,
  ApplySequencesJSON,
  BehaviorJSON,
  BehaviorJSONDefaults,
  ChangeEmitDirectionBehaviorJSON,
  ColorOverLifeBehaviorJSON,
  EmitSubParticleSystemBehaviorJSON,
  FrameOverLifeBehaviorJSON,
  GravityForceBehaviorJSON,
  IntervalValueJSON,
  NoiseBehaviorJSON,
  OrbitOverLifeBehaviorJSON,
  Rotation3DOverLifeBehaviorJSON,
  RotationOverLifeBehaviorJSON,
  SequencerJSON,
  SizeOverLifeBehaviorJSON,
  SpeedOverLifeBehaviorJSON,
  TurbulenceFieldBehaviorJSON,
  WidthOverLengthBehaviorJSON
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux'

import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
import { SceneObjectInput } from '../../inputs/SceneObjectInput'
import SelectInput from '../../inputs/SelectInput'
import StringInput from '../../inputs/StringInput'
import Vector3Input from '../../inputs/Vector3Input'
import PaginatedList from '../../layout/PaginatedList'
import ColorGenerator from './ColorGenerator'
import ValueGenerator from './ValueGenerator'

export default function BehaviorInput({
  scope,
  value,
  onChange
}: {
  scope: State<BehaviorJSON>
  value: BehaviorJSON
  onChange: (scope: State<any>) => (value: any) => void
}) {
  const onChangeBehaviorType = useCallback(() => {
    const onChangeType = onChange(scope.type)
    return (type: typeof value.type) => {
      const nuVals = BehaviorJSONDefaults[type]
      scope.set(nuVals)
      onChangeType(type)
    }
  }, [])

  const onChangeVec3 = useCallback((scope: State<any>) => {
    const thisOnChange = onChange(scope)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const applyForceInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const forceScope = scope as State<ApplyForceBehaviorJSON>
      const value = forceScope.value
      return (
        <>
          <InputGroup name="force" label="Force">
            <Vector3Input value={new Vector3(...value.direction)} onChange={onChange(forceScope.direction)} />
          </InputGroup>
          <InputGroup name="magnitude" label="Magnitude">
            <ValueGenerator scope={forceScope.magnitude} value={value.magnitude} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const noiseInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const noiseScope = scope as State<NoiseBehaviorJSON>
      const value = noiseScope.value
      return (
        <>
          <InputGroup name="frequency" label="Frequency">
            <Vector3Input value={new Vector3(...value.frequency)} onChange={onChangeVec3(noiseScope.frequency)} />
          </InputGroup>
          <InputGroup name="power" label="Power">
            <Vector3Input value={new Vector3(...value.power)} onChange={onChange(noiseScope.power)} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const turbulenceFieldInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const turbulenceScope = scope as State<TurbulenceFieldBehaviorJSON>
      const value = turbulenceScope.value
      return (
        <>
          <InputGroup name="scale" label="Scale">
            <Vector3Input value={new Vector3(...value.scale)} onChange={onChangeVec3(turbulenceScope.scale)} />
          </InputGroup>
          <NumericInputGroup
            name="octaves"
            label="Octaves"
            value={value.octaves}
            onChange={onChange(turbulenceScope.octaves)}
          />
          <InputGroup name="velocityMultiplier" label="Velocity Multiplier">
            <Vector3Input
              value={new Vector3(...value.velocityMultiplier)}
              onChange={onChangeVec3(turbulenceScope.velocityMultiplier)}
            />
          </InputGroup>
          <InputGroup name="timeScale" label="Time Scale">
            <Vector3Input value={new Vector3(...value.timeScale)} onChange={onChangeVec3(turbulenceScope.timeScale)} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const gravityForceInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const gravityScope = scope as State<GravityForceBehaviorJSON>
      const value = gravityScope.value
      return (
        <>
          <InputGroup name="center" label="Center">
            <Vector3Input value={new Vector3(...value.center)} onChange={onChangeVec3(gravityScope.center)} />
          </InputGroup>
          <NumericInputGroup
            name="magnitude"
            label="Magnitude"
            value={value.magnitude}
            onChange={onChange(gravityScope.magnitude)}
          />
        </>
      )
    },
    [scope]
  )

  const colorOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const colorScope = scope as State<ColorOverLifeBehaviorJSON>
      const value = colorScope.value
      return (
        <>
          <InputGroup name="color" label="Color">
            <ColorGenerator scope={colorScope.color} value={value.color} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const rotationOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const rotationScope = scope as State<RotationOverLifeBehaviorJSON>
      const value = rotationScope.value
      return (
        <>
          <InputGroup name="angularVelocity" label="Angular Velocity">
            <ValueGenerator scope={rotationScope.angularVelocity} value={value.angularVelocity} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const sizeOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const sizeScope = scope as State<SizeOverLifeBehaviorJSON>
      const value = sizeScope.value
      return (
        <>
          <InputGroup name="size" label="Size">
            <ValueGenerator scope={sizeScope.size} value={value.size} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const speedOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const speedScope = scope as State<SpeedOverLifeBehaviorJSON>
      const value = speedScope.value
      return (
        <>
          <InputGroup name="speed" label="Speed">
            <ValueGenerator scope={speedScope.speed} value={value.speed} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const frameOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const frameScope = scope as State<FrameOverLifeBehaviorJSON>
      const value = frameScope.value
      return (
        <>
          <InputGroup name="frame" label="Frame">
            <ValueGenerator scope={frameScope.frame} value={value.frame} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const orbitOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const orbitScope = scope as State<OrbitOverLifeBehaviorJSON>
      const value = orbitScope.value
      return (
        <>
          <InputGroup name="orbit" label="Orbit">
            <ValueGenerator scope={orbitScope.orbitSpeed} value={value.orbitSpeed} onChange={onChange} />
          </InputGroup>
          <InputGroup name="axis" label="Axis">
            <Vector3Input value={new Vector3(...value.axis)} onChange={onChangeVec3(orbitScope.axis)} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const widthOverLength = useCallback(
    (scope: State<BehaviorJSON>) => {
      const widthScope = scope as State<WidthOverLengthBehaviorJSON>
      const value = widthScope.value
      return (
        <>
          <InputGroup name="width" label="Width">
            <ValueGenerator scope={widthScope.width} value={value.width} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const changeEmitDirectionInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const changeEmitDirectionScope = scope as State<ChangeEmitDirectionBehaviorJSON>
      const value = changeEmitDirectionScope.value
      return (
        <>
          <InputGroup name="angle" label="Angle">
            <ValueGenerator scope={changeEmitDirectionScope.angle} value={value.angle} onChange={onChange} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const emitSubParticleSystemInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const emitSubParticleSystemScope = scope as State<EmitSubParticleSystemBehaviorJSON>
      const value = emitSubParticleSystemScope.value
      return (
        <>
          <InputGroup name="subParticleSystem" label="Sub Particle System">
            <SceneObjectInput
              value={value.subParticleSystem}
              onChange={onChange(emitSubParticleSystemScope.subParticleSystem)}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const applySequencesInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const applySequencesScope = scope as State<ApplySequencesJSON>
      const value = applySequencesScope.value
      return (
        <>
          <NumericInputGroup
            name="Delay"
            label="Delay"
            value={value.delay}
            onChange={onChange(applySequencesScope.delay)}
          />
          <PaginatedList
            list={applySequencesScope.sequencers}
            element={(sequencerScope: State<{ range: IntervalValueJSON; sequencer: SequencerJSON }>) => {
              const sequencer = sequencerScope.value
              return (
                <>
                  <NumericInputGroup
                    name="Start"
                    label="Start"
                    value={sequencer.range.a}
                    onChange={onChange(sequencerScope.range.a)}
                  />
                  <NumericInputGroup
                    name="End"
                    label="End"
                    value={sequencer.range.b}
                    onChange={onChange(sequencerScope.range.b)}
                  />
                  <NumericInputGroup
                    name="Scale X"
                    label="Scale X"
                    value={sequencer.sequencer.scaleX}
                    onChange={onChange(sequencerScope.sequencer.scaleX)}
                  />
                  <NumericInputGroup
                    name="Scale Y"
                    label="Scale Y"
                    value={sequencer.sequencer.scaleY}
                    onChange={onChange(sequencerScope.sequencer.scaleY)}
                  />
                  <InputGroup name="Position" label="Position">
                    <Vector3Input
                      value={sequencer.sequencer.position}
                      onChange={onChange(sequencerScope.sequencer.position)}
                    />
                  </InputGroup>
                </>
              )
            }}
          />
        </>
      )
    },
    [scope]
  )

  const inputs = {
    ApplyForce: applyForceInput,
    Noise: noiseInput,
    TurbulenceField: turbulenceFieldInput,
    GravityForce: gravityForceInput,
    ColorOverLife: colorOverLifeInput,
    RotationOverLife: rotationOverLifeInput,
    SizeOverLife: sizeOverLifeInput,
    SpeedOverLife: speedOverLifeInput,
    FrameOverLife: frameOverLifeInput,
    OrbitOverLife: orbitOverLifeInput,
    WidthOverLength: widthOverLength,
    ChangeEmitDirection: changeEmitDirectionInput,
    EmitSubParticleSystem: emitSubParticleSystemInput,
    ApplySequences: applySequencesInput
  }

  return (
    <>
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Apply Sequences', value: 'ApplySequences' },
            { label: 'Apply Force', value: 'ApplyForce' },
            { label: 'Noise', value: 'Noise' },
            { label: 'Turbulence Field', value: 'TurbulenceField' },
            { label: 'Gravity', value: 'GravityForce' },
            { label: 'Color Over Lifetime', value: 'ColorOverLife' },
            { label: 'Rotation Over Lifetime', value: 'RotationOverLife' },
            { label: 'Rotation3D Over Lifetime', value: 'Rotation3DOverLife' },
            { label: 'Size Over Lifetime', value: 'SizeOverLife' },
            { label: 'Speed Over Lifetime', value: 'SpeedOverLife' },
            { label: 'Frame Over Lifetime', value: 'FrameOverLife' },
            { label: 'Orbit Over Lifetime', value: 'OrbitOverLife' },
            { label: 'Width Over Length', value: 'WidthOverLength' },
            { label: 'Change Emit Direction', value: 'ChangeEmitDirection' },
            { label: 'Emit Sub Particle System', value: 'EmitSubParticleSystem' }
          ]}
          onChange={onChangeBehaviorType()}
        />
      </InputGroup>
      {inputs[value.type](scope)}
    </>
  )
}
