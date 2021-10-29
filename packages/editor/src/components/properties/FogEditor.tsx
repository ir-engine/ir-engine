import React, { useState, useCallback } from 'react'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import NumericInputGroup from '../inputs/NumericInputGroup'
import { FogComponent } from '@xrengine/engine/src/scene/components/FogComponent'
import { FogType } from '@xrengine/engine/src/scene/constants/FogType'
import { withTranslation } from 'react-i18next'

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
  }
]

/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @author Robert Long
 * @param       props
 * @constructor
 */
export const FogEditor = (node: any, t: Function) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onChangeFogType = (fogType) => {
    const fogComponent = getComponent(node.eid, FogComponent)
    fogComponent.type = fogType
    forceUpdate()
  }

  const onChangeFogDensity = (density) => {
    const fogComponent = getComponent(node.eid, FogComponent)
    fogComponent.density = density
    forceUpdate()
  }

  const onChangeFogColor = (color) => {
    const fogComponent = getComponent(node.eid, FogComponent)
    fogComponent.color = color
    forceUpdate()
  }

  const onChangeFogNearDistance = (near) => {
    const fogComponent = getComponent(node.eid, FogComponent)
    fogComponent.near = near
    forceUpdate()
  }

  const onChangeFogFarDistance = (far) => {
    const fogComponent = getComponent(node.eid, FogComponent)
    fogComponent.far = far
    forceUpdate()
  }

  const fogComponent = getComponent(node.eid, FogComponent)

  return (
    <NodeEditor node={node}>
      <InputGroup name="Fog Type" label={t('editor:properties.scene.lbl-fogType')}>
        <SelectInput options={FogTypeOptions} value={fogComponent.type} onChange={onChangeFogType} />
      </InputGroup>
      {fogComponent.type !== FogType.Disabled && (
        <InputGroup name="Fog Color" label={t('editor:properties.scene.lbl-fogColor')}>
          <ColorInput value={fogComponent.color} onChange={onChangeFogColor} />
        </InputGroup>
      )}
      {fogComponent.type === FogType.Linear && (
        <>
          <NumericInputGroup
            name="Fog Near Distance"
            label={t('editor:properties.scene.lbl-forNearDistance')}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            min={0}
            value={fogComponent.near}
            onChange={onChangeFogNearDistance}
          />
          <NumericInputGroup
            name="Fog Far Distance"
            label={t('editor:properties.scene.lbl-fogFarDistance')}
            smallStep={1}
            mediumStep={100}
            largeStep={1000}
            min={0}
            value={fogComponent.far}
            onChange={onChangeFogFarDistance}
          />
        </>
      )}
      {fogComponent.type === FogType.Exponential && (
        <NumericInputGroup
          name="Fog Density"
          label={t('editor:properties.scene.lbl-fogDensity')}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          min={0}
          value={fogComponent.density}
          onChange={onChangeFogDensity}
          displayPrecision={0.00001}
        />
      )}
    </NodeEditor>
  )
}

export default withTranslation()(FogEditor)
