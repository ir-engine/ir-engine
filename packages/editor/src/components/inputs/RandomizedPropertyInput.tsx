import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { RandomizedProperty } from '@xrengine/engine/src/scene/components/InstancingComponent'

import { Stack } from '@mui/material'

import CompoundNumericInput from './CompoundNumericInput'
import InputGroup from './InputGroup'

const PropertyContainer = (styled as any).div`
  display: flex;
  width: 100%;
  border-width: 2px;
  border: solid;
  border-color: #ffffff;
  margin: 8px;
  padding: 4px;
`

export default function RandomizedPropertyInputGroup({ name, label, value, onChange, ...rest }) {
  const { t } = useTranslation()
  const prop = value as RandomizedProperty
  function onChangeProp(key: keyof RandomizedProperty) {
    return (val) => {
      prop[key] = val
      onChange(value)
    }
  }
  return (
    <InputGroup name={name} label={label}>
      <PropertyContainer>
        <Stack>
          <CompoundNumericInput
            // name={`${name}-mu`}
            // label={t('editor:properties.randomizedProperty.lbl-mu')}
            value={prop.mu}
            onChange={onChangeProp('mu')}
            min={0.02}
            max={1}
            step={0.01}
          />
          <CompoundNumericInput
            // name={`${name}-sigma`}
            // label={t('editor:properties.randomizedProperty.lbl-sigma')}
            value={prop.sigma}
            onChange={onChangeProp('sigma')}
            min={0.01}
            max={1}
            step={0.01}
          />
        </Stack>
      </PropertyContainer>
    </InputGroup>
  )
}
