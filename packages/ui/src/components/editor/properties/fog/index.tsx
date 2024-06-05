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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { FogSettingsComponent, FogType } from '@etherealengine/spatial/src/renderer/components/FogSettingsComponent'

import {
  EditorComponentType,
  commitProperty,
  updateProperty
} from '@etherealengine/editor/src/components/properties/Util'
import ColorInput from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import PropertyGroup from '../group'

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
          onChange={commitProperty(FogSettingsComponent, 'type')}
        />
      </InputGroup>
      {fogState.type.value !== FogType.Disabled && (
        <>
          <InputGroup name="Fog Color" label={t('editor:properties.fog.lbl-fogColor')}>
            <ColorInput
              value={new Color(fogState.color.value)}
              onChange={(val) => updateProperty(FogSettingsComponent, 'color')('#' + val.getHexString())}
            />
          </InputGroup>
          {fogState.type.value === FogType.Linear ? (
            <>
              <InputGroup name="Fog Near Distance" label={t('editor:properties.fog.lbl-forNearDistance')}>
                <NumericInput
                  smallStep={0.1}
                  mediumStep={1}
                  largeStep={10}
                  min={0}
                  value={fogState.near.value}
                  onChange={updateProperty(FogSettingsComponent, 'near')}
                  onRelease={commitProperty(FogSettingsComponent, 'near')}
                />
              </InputGroup>
              <InputGroup name="Fog Far Distance" label={t('editor:properties.fog.lbl-fogFarDistance')}>
                <NumericInput
                  smallStep={1}
                  mediumStep={100}
                  largeStep={1000}
                  min={0}
                  value={fogState.far.value}
                  onChange={updateProperty(FogSettingsComponent, 'far')}
                  onRelease={commitProperty(FogSettingsComponent, 'far')}
                />
              </InputGroup>
            </>
          ) : (
            <>
              <InputGroup name="Fog Density" label={t('editor:properties.fog.lbl-fogDensity')}>
                <NumericInput
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={0.25}
                  min={0}
                  value={fogState.density.value}
                  onChange={updateProperty(FogSettingsComponent, 'density')}
                  onRelease={commitProperty(FogSettingsComponent, 'density')}
                />
              </InputGroup>
              {fogState.type.value !== FogType.Exponential && (
                <InputGroup name="Fog Height" label={t('editor:properties.fog.lbl-fogHeight')}>
                  <NumericInput
                    smallStep={0.01}
                    mediumStep={0.1}
                    largeStep={0.25}
                    min={0}
                    value={fogState.height.value}
                    onChange={updateProperty(FogSettingsComponent, 'height')}
                    onRelease={commitProperty(FogSettingsComponent, 'height')}
                  />
                </InputGroup>
              )}
              {fogState.type.value === FogType.Brownian && (
                <InputGroup name="Fog Time Scale" label={t('editor:properties.fog.lbl-fogTimeScale')}>
                  <NumericInput
                    smallStep={0.01}
                    mediumStep={0.1}
                    largeStep={0.25}
                    min={0.001}
                    value={fogState.timeScale.value}
                    onChange={updateProperty(FogSettingsComponent, 'timeScale')}
                    onRelease={commitProperty(FogSettingsComponent, 'timeScale')}
                  />
                </InputGroup>
              )}
            </>
          )}
        </>
      )}
    </PropertyGroup>
  )
}

export default FogSettingsEditor
