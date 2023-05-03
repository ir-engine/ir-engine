import React from 'react'
import { useCallback } from 'react'
import { Vector3 } from 'three'

import {
  AxisAngleGeneratorJSON,
  EulerGeneratorJSON,
  RotationGeneratorJSON,
  RotationGeneratorJSONDefaults
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux'

import InputGroup from '../../inputs/InputGroup'
import SelectInput from '../../inputs/SelectInput'
import Vector3Input from '../../inputs/Vector3Input'
import ValueGenerator from './ValueGenerator'

export default function RotationGenerator({
  scope,
  value,
  onChange
}: {
  scope: State<RotationGeneratorJSON>
  value: RotationGeneratorJSON
  onChange: (scope: State<any>) => (value: any) => void
}) {
  const onChangeVec3 = useCallback((scope: State<any>) => {
    const thisOnChange = onChange(scope)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const AxisAngleGeneratorInput = useCallback(() => {
    const axisAngleScope = scope as State<AxisAngleGeneratorJSON>
    const axisAngle = axisAngleScope.value
    return (
      <>
        <InputGroup name="Axis" label="Axis">
          <Vector3Input value={new Vector3(...axisAngle.axis)} onChange={onChangeVec3(axisAngleScope.axis)} />
        </InputGroup>
        <InputGroup name="Angle" label="Angle">
          <ValueGenerator scope={axisAngleScope.angle} value={axisAngle.angle} onChange={onChange} />
        </InputGroup>
      </>
    )
  }, [])

  const EulerGeneratorInput = useCallback(() => {
    const eulerScope = scope as State<EulerGeneratorJSON>
    const euler = eulerScope.value
    return (
      <>
        <InputGroup name="Angle X" label="Angle X">
          <ValueGenerator scope={eulerScope.angleX} value={euler.angleX} onChange={onChange} />
        </InputGroup>
        <InputGroup name="Angle Y" label="Angle Y">
          <ValueGenerator scope={eulerScope.angleY} value={euler.angleY} onChange={onChange} />
        </InputGroup>
        <InputGroup name="Angle Z" label="Angle Z">
          <ValueGenerator scope={eulerScope.angleZ} value={euler.angleZ} onChange={onChange} />
        </InputGroup>
      </>
    )
  }, [])

  const RandomQuatGeneratorInput = useCallback(() => {
    return <></>
  }, [])

  const onChangeRotationType = useCallback(() => {
    const thisOnChange = onChange(scope.type)
    return (type: typeof value.type) => {
      scope.set(RotationGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

  const rotationInputs = {
    AxisAngle: AxisAngleGeneratorInput,
    Euler: EulerGeneratorInput,
    RandomQuat: RandomQuatGeneratorInput
  }

  return (
    <>
      <InputGroup name="Type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Axis Angle', value: 'AxisAngle' },
            { label: 'Euler', value: 'Euler' },
            { label: 'Random Quaternion', value: 'RandomQuat' }
          ]}
          onChange={onChangeRotationType()}
        />
      </InputGroup>
      {rotationInputs[value.type]()}
    </>
  )
}
