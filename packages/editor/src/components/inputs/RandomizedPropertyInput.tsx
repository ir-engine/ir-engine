/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { RandomizedProperty } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { State } from '@etherealengine/hyperflux'

import { Stack } from '@mui/material'

import CompoundNumericInput from './CompoundNumericInput'
import InputGroup from './InputGroup'

const PropertyContainerStyle = {
  display: 'flex',
  width: '100%',
  borderWidth: '2px',
  border: 'solid',
  borderColor: '#ffffff',
  margin: '8px',
  padding: '4px'
}

export default function RandomizedPropertyInputGroup({
  name,
  label,
  state,
  onChange,
  ...rest
}: {
  name: string
  label: string
  state: State<RandomizedProperty>
  onChange: (value: RandomizedProperty) => void
}) {
  const value = state.value
  const { t } = useTranslation()
  const prop = value as RandomizedProperty
  const onChangeProp = useCallback(
    (key: keyof RandomizedProperty) => {
      return (val) => {
        const value = { ...prop, [key]: val }
        onChange(value)
      }
    },
    [onChange, value]
  )

  return (
    <InputGroup name={name} label={label}>
      <div style={PropertyContainerStyle}>
        <Stack>
          <CompoundNumericInput value={prop.mu} onChange={onChangeProp('mu')} min={0.02} max={1} step={0.01} />
          <CompoundNumericInput value={prop.sigma} onChange={onChangeProp('sigma')} min={0.01} max={1} step={0.01} />
        </Stack>
      </div>
    </InputGroup>
  )
}
