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
  WidthOverLengthBehaviorJSON
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux'

import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
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
      {(() => {
        switch (value.type) {
          case 'ApplyForce':
            const forceScope = scope as State<ApplyForceBehaviorJSON>
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
          case 'Noise':
            const noiseScope = scope as State<NoiseBehaviorJSON>
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
          case 'TurbulenceField':
            const turbulenceScope = scope as State<NoiseBehaviorJSON>
            return (
              <>
                <InputGroup name="scale" label="Scale">
                  <Vector3Input value={new Vector3(...value.scale)} onChange={onChangeVec3('scale')} />
                </InputGroup>
                <NumericInputGroup
                  name="octaves"
                  label="Octaves"
                  value={value.octaves}
                  onChange={onChange('octaves')}
                />
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
          case 'GravityForce':
            const gravityScope = scope as State<GravityForceBehaviorJSON>
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
          case 'ColorOverLife':
            const colorScope = scope as State<ColorOverLifeBehaviorJSON>
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
          case 'RotationOverLife':
            const rotationScope = scope as State<RotationOverLifeBehaviorJSON>
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
          case 'Rotation3DOverLife':
            const rotation3DScope = scope as State<Rotation3DOverLifeBehaviorJSON>
            return <></>
          case 'SizeOverLife':
            const sizeScope = scope as State<SizeOverLifeBehaviorJSON>
            return (
              <>
                <InputGroup name="size" label="Size">
                  <ValueGenerator
                    scope={sizeScope.size}
                    value={value.size}
                    onChange={onChangeProp(sizeScope.size, 'size')}
                  />
                </InputGroup>
              </>
            )
          case 'SpeedOverLife':
            const speedScope = scope as State<SpeedOverLifeBehaviorJSON>
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
          case 'FrameOverLife':
            const frameScope = scope as State<FrameOverLifeBehaviorJSON>
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
          case 'OrbitOverLife':
            const orbitScope = scope as State<OrbitOverLifeBehaviorJSON>
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
          case 'WidthOverLength':
            const widthScope = scope as State<WidthOverLengthBehaviorJSON>
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
          case 'ChangeEmitDirection':
            const changeEmitDirectionScope = scope as State<ChangeEmitDirectionBehaviorJSON>
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
          case 'EmitSubParticleSystem':
            const emitSubParticleSystemScope = scope as State<EmitSubParticleSystemBehaviorJSON>
            return (
              <>
                <InputGroup name="subParticleSystem" label="Sub Particle System">
                  <StringInput
                    value={value.subParticleSystem}
                    onChange={onChangeProp(emitSubParticleSystemScope.subParticleSystem, 'subParticleSystem')}
                  />
                </InputGroup>
              </>
            )
        }
      })()}
    </>
  )
}
