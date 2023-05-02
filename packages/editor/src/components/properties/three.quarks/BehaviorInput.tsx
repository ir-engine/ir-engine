import React, { useCallback } from 'react'
import { Vector3 } from 'three'

import {
  ApplyForceBehaviorJSON,
  BehaviorJSON,
  BehaviorJSONDefaults,
  ChangeEmitDirectionBehaviorJSON,
  ColorOverLifeBehaviorJSON,
  EmitSubParticleSystemBehaviorJSON,
  FrameOverLifeBehaviorJSON,
  GravityForceBehaviorJSON,
  NoiseBehaviorJSON,
  OrbitOverLifeBehaviorJSON,
  Rotation3DOverLifeBehaviorJSON,
  RotationOverLifeBehaviorJSON,
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
import ColorGenerator from './ColorGenerator'
import ValueGenerator from './ValueGenerator'

export default function BehaviorInput({
  scope,
  value,
  onChange
}: {
  scope: State<BehaviorJSON>
  value: BehaviorJSON
  onChange: (key: string) => (value: any) => void
}) {
  const onChangeProp = useCallback(
    (scope: State<any>, scopeKey: string) => (key: string) => {
      const topOnChange = onChange(scopeKey)
      return (keyVal: any) => {
        const nuVal = { ...JSON.parse(JSON.stringify(scope.value)), [key]: keyVal }
        topOnChange(nuVal)
      }
    },
    []
  )

  const onChangeVec3 = useCallback((key: string) => {
    const thisOnChange = onChange(key)
    return (value: Vector3) => {
      thisOnChange(value.toArray())
    }
  }, [])

  const onChangeBehaviorType = useCallback(() => {
    const onChangeType = onChange('type')
    return (type: typeof value.type) => {
      const nuVals = BehaviorJSONDefaults[type]
      scope.set(nuVals)
      onChangeType(type)
    }
  }, [])

  const applyForceInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const forceScope = scope as State<ApplyForceBehaviorJSON>
      const value = forceScope.value
      return (
        <>
          <InputGroup name="force" label="Force">
            <Vector3Input value={new Vector3(...value.direction)} onChange={onChangeVec3('direction')} />
          </InputGroup>
          <InputGroup name="magnitude" label="Magnitude">
            <ValueGenerator
              scope={forceScope.magnitude}
              value={value.magnitude}
              onChange={onChangeProp(forceScope.magnitude, 'magnitude')}
            />
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
            <Vector3Input value={new Vector3(...value.frequency)} onChange={onChangeVec3('frequency')} />
          </InputGroup>
          <InputGroup name="power" label="Power">
            <Vector3Input value={new Vector3(...value.power)} onChange={onChange('power')} />
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
            <Vector3Input value={new Vector3(...value.scale)} onChange={onChangeVec3('scale')} />
          </InputGroup>
          <NumericInputGroup name="octaves" label="Octaves" value={value.octaves} onChange={onChange('octaves')} />
          <InputGroup name="velocityMultiplier" label="Velocity Multiplier">
            <Vector3Input
              value={new Vector3(...value.velocityMultiplier)}
              onChange={onChangeVec3('velocityMultiplier')}
            />
          </InputGroup>
          <InputGroup name="timeScale" label="Time Scale">
            <Vector3Input value={new Vector3(...value.timeScale)} onChange={onChangeVec3('timeScale')} />
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
            <Vector3Input value={new Vector3(...value.center)} onChange={onChangeVec3('center')} />
          </InputGroup>
          <NumericInputGroup
            name="magnitude"
            label="Magnitude"
            value={value.magnitude}
            onChange={onChange('magnitude')}
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
            <ColorGenerator
              scope={colorScope.color}
              value={value.color}
              onChange={onChangeProp(colorScope.color, 'color')}
            />
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
            <ValueGenerator
              scope={rotationScope.angularVelocity}
              value={value.angularVelocity}
              onChange={onChangeProp(rotationScope.angularVelocity, 'angularVelocity')}
            />
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
            <ValueGenerator scope={sizeScope.size} value={value.size} onChange={onChangeProp(sizeScope.size, 'size')} />
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
            <ValueGenerator
              scope={speedScope.speed}
              value={value.speed}
              onChange={onChangeProp(speedScope.speed, 'speed')}
            />
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
            <ValueGenerator
              scope={frameScope.frame}
              value={value.frame}
              onChange={onChangeProp(frameScope.frame, 'frame')}
            />
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
            <ValueGenerator
              scope={orbitScope.orbitSpeed}
              value={value.orbitSpeed}
              onChange={onChangeProp(orbitScope.orbitSpeed, 'orbitSpeed')}
            />
          </InputGroup>
          <InputGroup name="axis" label="Axis">
            <Vector3Input value={new Vector3(...value.axis)} onChange={onChangeVec3('axis')} />
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
            <ValueGenerator
              scope={widthScope.width}
              value={value.width}
              onChange={onChangeProp(widthScope.width, 'width')}
            />
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
            <ValueGenerator
              scope={changeEmitDirectionScope.angle}
              value={value.angle}
              onChange={onChangeProp(changeEmitDirectionScope.angle, 'angle')}
            />
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
              onChange={onChangeProp(emitSubParticleSystemScope.subParticleSystem, 'subParticleSystem')}
            />
          </InputGroup>
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
    EmitSubParticleSystem: emitSubParticleSystemInput
  }

  return (
    <>
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
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
