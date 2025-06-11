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

import React from 'react'

import {
  ColorGeneratorJSON,
  ColorGradientFunctionJSON,
  ColorGradientJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { State } from '@ir-engine/hyperflux'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../primitives/tailwind/Button'
import Text from '../../../../../primitives/tailwind/Text'
import NumericInput from '../../Numeric'
import { ColorJSONInput } from './ColorJSONInput'

type GradientInputItemProps = Readonly<{
  path: string
  index: number
  item: ColorGradientFunctionJSON
  scope: State<ColorGeneratorJSON>
  onChange: (path: string) => (value: any) => void
}>

export function GradientInputItem({ path, index, item, scope, onChange }: GradientInputItemProps) {
  const { t } = useTranslation()

  const startPath = `${path}.functions.${index}.start`
  const functionAPath = `${path}.functions.${index}.function.a`
  const functionBPath = `${path}.functions.${index}.function.b`

  const handleRemoveGradient = () => {
    const gradientScope = scope as State<ColorGradientJSON>
    const gradient = gradientScope.value
    const thisOnChange = onChange(path + '.functions')
    const nuFunctions = [...gradient.functions]
    nuFunctions.splice(index, 1)
    thisOnChange(JSON.parse(JSON.stringify(nuFunctions)))
  }

  return (
    <div key={index} className="m-4 overflow-visible rounded-lg border border-white p-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-x-1">
          <Text className="text-text-primary" fontSize="xs">
            {t('editor:properties.particle-system.startColor.start')}
          </Text>
          <NumericInput value={item.start} onChange={onChange(startPath)} min={0} max={0.99} />
        </div>

        <div className="flex items-center gap-x-1">
          <Text className="text-text-primary" fontSize="xs">
            A
          </Text>
          <div className="col-span-1 grid">
            <ColorJSONInput value={item.function.a} onChange={onChange(functionAPath)} />
          </div>
        </div>
        <div className="flex items-center gap-x-1">
          <Text className="text-text-primary" fontSize="xs">
            B
          </Text>
          <div className="col-span-1 grid">
            <ColorJSONInput value={item.function.b} onChange={onChange(functionBPath)} />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Button onClick={handleRemoveGradient}>{t('editor:properties.particle-system.startColor.remove')}</Button>
      </div>
    </div>
  )
}
