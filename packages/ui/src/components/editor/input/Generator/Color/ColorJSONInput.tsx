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
