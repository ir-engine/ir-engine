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

import { ColorJSON } from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'
import ColorInput from '../../../../../primitives/tailwind/Color'
import InputGroup from '../../Group'
import NumericInput from '../../Numeric'

type ColorJSONInputProps = Readonly<{
  value: ColorJSON
  onChange: (color: ColorJSON) => void
}>

export function ColorJSONInput({ value, onChange }: ColorJSONInputProps) {
  const { t } = useTranslation()

  const handleChangeColor = ({ r, g, b }: Color) => {
    onChange({ r, g, b, a: value.a })
  }

  const handleChangeGradient = (alpha: number) => {
    onChange({ r: value.r, g: value.g, b: value.b, a: alpha })
  }

  return (
    <>
      <InputGroup name="color" label={t('editor:properties.particle-system.startColor.color')}>
        <ColorInput value={new Color(value.r, value.g, value.b)} onChange={handleChangeColor} />
      </InputGroup>
      <InputGroup name="opacity" label={t('editor:properties.particle-system.startColor.opacity')}>
        <NumericInput value={value.a} onChange={handleChangeGradient} />
      </InputGroup>
    </>
  )
}
