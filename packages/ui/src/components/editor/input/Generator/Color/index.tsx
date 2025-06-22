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

import React, { useCallback } from 'react'

import { State } from '@ir-engine/hyperflux'

import {
  ColorGeneratorJSON,
  ColorGeneratorJSONDefaults,
  ColorGradientJSON,
  ColorRangeJSON,
  ConstantColorJSON,
  RandomColorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { t as translate } from 'i18next'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../primitives/tailwind/Button'
import { OptionType } from '../../../../../primitives/tailwind/Select'
import InputGroup from '../../Group'
import SelectInput from '../../Select'
import { ColorJSONInput } from './ColorJSONInput'
import { GradientInputItem } from './GradientInputItem'

const colorOptions: OptionType[] = [
  { label: translate('editor:properties.particle-system.startColor.constant'), value: 'ConstantColor' },
  { label: translate('editor:properties.particle-system.startColor.range'), value: 'ColorRange' },
  { label: translate('editor:properties.particle-system.startColor.random'), value: 'RandomColor' },
  { label: translate('editor:properties.particle-system.startColor.gradient'), value: 'Gradient' }
]

type ColorGeneratorProps = Readonly<{
  path: string
  scope: State<ColorGeneratorJSON>
  value: ColorGeneratorJSON
  onChange: (path: string) => (value: any) => void
}>
export default function ColorGenerator({ path, scope, value, onChange }: ColorGeneratorProps) {
  const { t } = useTranslation()

  const onChangeType = useCallback(() => {
    const thisOnChange = onChange(path + '.type')
    return (type: typeof value.type) => {
      scope.set(ColorGeneratorJSONDefaults[type])
      thisOnChange(type)
    }
  }, [])

  const ConstantColorInput = useCallback(() => {
    const constantScope = scope as State<ConstantColorJSON>
    const constant = constantScope.value

    return <ColorJSONInput value={constant.color} onChange={onChange(path + '.color')} />
  }, [scope])

  const ColorRangeInput = useCallback(() => {
    const rangeScope = scope as State<ColorRangeJSON>
    const range = rangeScope.value

    return (
      <>
        <InputGroup name="A" label="A" containerClassName="pl-0">
          <ColorJSONInput value={range.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup name="B" label="B" containerClassName="pl-0">
          <ColorJSONInput value={range.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [scope])

  const RandomColorInput = useCallback(() => {
    const randomScope = scope as State<RandomColorJSON>
    const random = randomScope.value

    return (
      <>
        <InputGroup name="A" label="A" containerClassName="pl-0">
          <ColorJSONInput value={random.a} onChange={onChange(path + '.a')} />
        </InputGroup>
        <InputGroup name="B" label="B" containerClassName="pl-0">
          <ColorJSONInput value={random.b} onChange={onChange(path + '.b')} />
        </InputGroup>
      </>
    )
  }, [scope])

  const GradientInput = useCallback(() => {
    const gradientScope = scope as State<ColorGradientJSON>
    const gradient = gradientScope.value

    const handleAddGradient = () => {
      const gradientState = scope as State<ColorGradientJSON>
      gradientState.functions.set([
        ...JSON.parse(JSON.stringify(gradient.functions)),
        {
          start: 0,
          function: {
            type: 'ColorRange',
            a: { r: 1, g: 1, b: 1, a: 1 },
            b: { r: 1, g: 1, b: 1, a: 1 }
          }
        }
      ])
    }

    return (
      <div>
        <Button onClick={handleAddGradient}>+</Button>

        {gradient.functions.map((item, index) => (
          <GradientInputItem key={index} path={path} index={index} item={item} scope={scope} onChange={onChange} />
        ))}
      </div>
    )
  }, [scope])

  const colorInputs = {
    ConstantColor: ConstantColorInput,
    ColorRange: ColorRangeInput,
    RandomColor: RandomColorInput,
    Gradient: GradientInput
  }

  return (
    <div>
      <InputGroup name="type" label={t('editor:properties.particle-system.startColor.type')} containerClassName="pl-0">
        <SelectInput value={value.type} options={colorOptions} onChange={onChangeType()} />
      </InputGroup>
      {colorInputs[value.type]()}
    </div>
  )
}
