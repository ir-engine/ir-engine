import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { FogSettingsComponent } from '@etherealengine/engine/src/scene/components/FogSettingsComponent'
import { FogType } from '@etherealengine/engine/src/scene/constants/FogType'

import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import PropertyGroup from './PropertyGroup'
import { EditorComponentType } from './Util'

const FogTypeOptions = [
  {
    label: 'Disabled',
    value: FogType.Disabled
  },
  {
    label: 'Linear',
    value: FogType.Linear
  },
  {
    label: 'Exponential',
    value: FogType.Exponential
  },
  {
    label: 'Brownian Motion',
    value: FogType.Brownian
  },
  {
    label: 'Height',
    value: FogType.Height
  }
]

export const FogSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const fogState = useComponent(props.entity, FogSettingsComponent)

  return (
    <PropertyGroup name={t('editor:properties.fog.name')} description={t('editor:properties.fog.description')}>
      <InputGroup name="Fog Type" label={t('editor:properties.fog.lbl-fogType')}>
        <SelectInput
          options={FogTypeOptions}
          value={fogState.type.value}
          onChange={(val: FogType) => fogState.type.set(val)}
        />
      </InputGroup>
      {fogState.type.value !== FogType.Disabled && (
        <>
          <InputGroup name="Fog Color" label={t('editor:properties.fog.lbl-fogColor')}>
            <ColorInput
              value={new Color(fogState.color.value)}
              onSelect={(val: Color) => fogState.color.set('#' + val.getHexString())}
            />
          </InputGroup>
          {fogState.type.value === FogType.Linear ? (
            <>
              <NumericInputGroup
                name="Fog Near Distance"
                label={t('editor:properties.fog.lbl-forNearDistance')}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                min={0}
                value={fogState.near.value}
                onChange={(val) => fogState.near.set(val)}
              />
              <NumericInputGroup
                name="Fog Far Distance"
                label={t('editor:properties.fog.lbl-fogFarDistance')}
                smallStep={1}
                mediumStep={100}
                largeStep={1000}
                min={0}
                value={fogState.far.value}
                onChange={(val) => fogState.far.set(val)}
              />
            </>
          ) : (
            <>
              <NumericInputGroup
                name="Fog Density"
                label={t('editor:properties.fog.lbl-fogDensity')}
                smallStep={0.01}
                mediumStep={0.1}
                largeStep={0.25}
                min={0}
                value={fogState.density.value}
                onChange={(val) => fogState.density.set(val)}
              />
              {fogState.type.value !== FogType.Exponential && (
                <NumericInputGroup
                  name="Fog Height"
                  label={t('editor:properties.fog.lbl-fogHeight')}
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={0.25}
                  min={0}
                  value={fogState.height.value}
                  onChange={(val) => fogState.height.set(val)}
                />
              )}
              {fogState.type.value === FogType.Brownian && (
                <NumericInputGroup
                  name="Fog Time Scale"
                  label={t('editor:properties.fog.lbl-fogTimeScale')}
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={0.25}
                  min={0.001}
                  value={fogState.timeScale.value}
                  onChange={(val) => fogState.timeScale.set(val)}
                />
              )}
            </>
          )}
        </>
      )}
    </PropertyGroup>
  )
}
