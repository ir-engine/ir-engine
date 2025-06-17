/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  AxisAngleGeneratorJSON,
  EulerGeneratorJSON,
  RotationGeneratorJSON,
  RotationGeneratorJSONDefaults,
  ValueGeneratorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { State } from '@ir-engine/hyperflux'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Vector3 } from 'three'
import InputGroup from '../../Group'
import SelectInput from '../../Select'
import Vector3Input from '../../Vector3'
import ValueGenerator from '../Value'

type RotationGeneratorProps = Readonly<{
  path: string
  scope: State<RotationGeneratorJSON>
  value: RotationGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>
export default function RotationGenerator({ path, scope, value, onChange }: RotationGeneratorProps) {
  const { t } = useTranslation()

  const onChangeVec3 = useCallback((path: string) => {
    const thisOnChange = onChange(path)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const AxisAngleGeneratorInput = useCallback(() => {
    const axisAngleScope = scope as State<AxisAngleGeneratorJSON>
    const axisAngle = axisAngleScope.value

    if (!axisAngle.axis || !axisAngle.angle) {
      const defaultAxisAngle = RotationGeneratorJSONDefaults['AxisAngle'] as AxisAngleGeneratorJSON
      axisAngleScope.set(defaultAxisAngle)

      return
    }

    return (
      <>
        <InputGroup name="Axis" label={t('editor:properties.particle-system.rotation.axis')}>
          <Vector3Input value={new Vector3(...axisAngle.axis)} onChange={onChangeVec3(path + '.axis')} />
        </InputGroup>
        <InputGroup name="Angle" label={t('editor:properties.particle-system.rotation.angle')}>
          <ValueGenerator
            path={path + '.angle'}
            scope={axisAngleScope.angle}
            value={axisAngle.angle as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
      </>
    )
  }, [])

  const EulerGeneratorInput = useCallback(() => {
    const eulerScope = scope as State<EulerGeneratorJSON>
    const euler = eulerScope.value

    if (!euler.angleX || !euler.angleY || !euler.angleZ) {
      const defaultEuler = RotationGeneratorJSONDefaults['Euler'] as EulerGeneratorJSON
      eulerScope.set(defaultEuler)

      return
    }

    return (
      <>
        <InputGroup
          name="Angle X"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'X' })}
        >
          <ValueGenerator
            path={path + '.angleX'}
            scope={eulerScope.angleX}
            value={euler.angleX as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
        <InputGroup
          name="Angle Y"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'Y' })}
        >
          <ValueGenerator
            path={path + '.angleY'}
            scope={eulerScope.angleY}
            value={euler.angleY as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
        <InputGroup
          name="Angle Z"
          label={t('editor:properties.particle-system.rotation.anglePosition', { position: 'Z' })}
        >
          <ValueGenerator
            path={path + '.angleZ'}
            scope={eulerScope.angleZ}
            value={euler.angleZ as ValueGeneratorJSON}
            onChange={onChange}
          />
        </InputGroup>
      </>
    )
  }, [scope, path, onChange, t])

  const RandomQuatGeneratorInput = useCallback(() => {
    return <></>
  }, [])

  const onChangeRotationType = useCallback(() => {
    const thisOnChange = onChange(path)
    return (type: typeof value.type) => {
      const defaultValue = RotationGeneratorJSONDefaults[type]
      scope.set(defaultValue)

      thisOnChange(type)
    }
  }, [])

  const rotationInputs = {
    AxisAngle: AxisAngleGeneratorInput,
    Euler: EulerGeneratorInput,
    RandomQuat: RandomQuatGeneratorInput
  }

  const rotationValue = useMemo(() => {
    if (value.type) {
      return value.type
    }

    return value
  }, [value])

  return (
    <>
      <InputGroup name="Type" label="Type">
        <SelectInput
          value={rotationValue}
          options={[
            { label: t('editor:properties.particle-system.rotation.axisAngle'), value: 'AxisAngle' },
            { label: t('editor:properties.particle-system.rotation.euler'), value: 'Euler' },
            { label: t('editor:properties.particle-system.rotation.randomQuaternion'), value: 'RandomQuat' }
          ]}
          onChange={onChangeRotationType()}
        />
      </InputGroup>
      {rotationInputs[rotationValue]()}
    </>
  )
}
