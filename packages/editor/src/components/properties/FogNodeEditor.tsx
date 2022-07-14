import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { FogComponent } from '@xrengine/engine/src/scene/components/FogComponent'
import { FogType } from '@xrengine/engine/src/scene/constants/FogType'

import { BlurOn } from '@mui/icons-material'

import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * FogTypeOptions array containing fogType options.
 *
 * @author Robert Long
 * @type {Array}
 */
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

/**
 *
 * FogNodeEditor component used to customize the ambient light element on the scene
 * ambient light is basically used to illuminates all the objects present inside the scene.
 *
 * @author Robert Long
 * @type {[component class]}
 */
export const FogNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const fogComponent = getComponent(props.node.entity, FogComponent)

  return (
    <NodeEditor {...props} name={t('editor:properties.fog.name')} description={t('editor:properties.fog.description')}>
      <InputGroup name="Fog Type" label={t('editor:properties.fog.lbl-fogType')}>
        <SelectInput
          key={props.node.entity}
          options={FogTypeOptions}
          value={fogComponent.type}
          onChange={updateProperty(FogComponent, 'type')}
        />
      </InputGroup>
      {fogComponent.type !== FogType.Disabled && (
        <>
          <InputGroup name="Fog Color" label={t('editor:properties.fog.lbl-fogColor')}>
            <ColorInput value={fogComponent.color} onChange={updateProperty(FogComponent, 'color')} />
          </InputGroup>
          {fogComponent.type === FogType.Linear ? (
            <>
              <NumericInputGroup
                name="Fog Near Distance"
                label={t('editor:properties.fog.lbl-forNearDistance')}
                smallStep={0.1}
                mediumStep={1}
                largeStep={10}
                min={0}
                value={fogComponent.near}
                onChange={updateProperty(FogComponent, 'near')}
              />
              <NumericInputGroup
                name="Fog Far Distance"
                label={t('editor:properties.fog.lbl-fogFarDistance')}
                smallStep={1}
                mediumStep={100}
                largeStep={1000}
                min={0}
                value={fogComponent.far}
                onChange={updateProperty(FogComponent, 'far')}
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
                value={fogComponent.density}
                onChange={updateProperty(FogComponent, 'density')}
              />
              {fogComponent.type !== FogType.Exponential && (
                <NumericInputGroup
                  name="Fog Height"
                  label={t('editor:properties.fog.lbl-fogHeight')}
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={0.25}
                  min={0}
                  value={fogComponent.height}
                  onChange={updateProperty(FogComponent, 'height')}
                />
              )}
              {fogComponent.type === FogType.Brownian && (
                <NumericInputGroup
                  name="Fog Time Scale"
                  label={t('editor:properties.fog.lbl-fogTimeScale')}
                  smallStep={0.01}
                  mediumStep={0.1}
                  largeStep={0.25}
                  min={0.001}
                  value={fogComponent.timeScale}
                  onChange={updateProperty(FogComponent, 'timeScale')}
                />
              )}
            </>
          )}
        </>
      )}
    </NodeEditor>
  )
}

FogNodeEditor.iconComponent = BlurOn

export default FogNodeEditor
