import React from 'react'
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
export class FogEditor extends React.Component<{node: any, t: Function}> {
  onChangeFogType = (fogType) => {
    const fogComponent = getComponent(this.props.node.eid, FogComponent)
    fogComponent.type = fogType
    this.forceUpdate()
  }

  onChangeFogDensity = (density) => {
    const fogComponent = getComponent(this.props.node.eid, FogComponent)
    fogComponent.density = density
    this.forceUpdate()
  }

  onChangeFogColor = (color) => {
    const fogComponent = getComponent(this.props.node.eid, FogComponent)
    fogComponent.color = color
    this.forceUpdate()
  }

  onChangeFogNearDistance = (near) => {
    const fogComponent = getComponent(this.props.node.eid, FogComponent)
    fogComponent.near = near
    this.forceUpdate()
  }

  onChangeFogFarDistance = (far) => {
    const fogComponent = getComponent(this.props.node.eid, FogComponent)
    fogComponent.far = far
    this.forceUpdate()
  }

  render() {
    const fogComponent = getComponent(this.props.node.eid, FogComponent)

    return (
      <NodeEditor {...this.props}>
        <InputGroup name="Fog Type" label={this.props.t('editor:properties.scene.lbl-fogType')}>
          <SelectInput options={FogTypeOptions} value={fogComponent.type} onChange={this.onChangeFogType} />
        </InputGroup>
        {fogComponent.type !== FogType.Disabled && (
          <InputGroup name="Fog Color" label={this.props.t('editor:properties.scene.lbl-fogColor')}>
            <ColorInput value={fogComponent.color} onChange={this.onChangeFogColor} />
          </InputGroup>
        )}
        {fogComponent.type === FogType.Linear && (
          <>
            <NumericInputGroup
              name="Fog Near Distance"
              label={this.props.t('editor:properties.scene.lbl-forNearDistance')}
              smallStep={0.1}
              mediumStep={1}
              largeStep={10}
              min={0}
              value={fogComponent.near}
              onChange={this.onChangeFogNearDistance}
            />
            <NumericInputGroup
              name="Fog Far Distance"
              label={this.props.t('editor:properties.scene.lbl-fogFarDistance')}
              smallStep={1}
              mediumStep={100}
              largeStep={1000}
              min={0}
              value={fogComponent.far}
              onChange={this.onChangeFogFarDistance}
            />
          </>
        )}
        {fogComponent.type === FogType.Exponential && (
          <NumericInputGroup
            name="Fog Density"
            label={this.props.t('editor:properties.scene.lbl-fogDensity')}
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            min={0}
            value={fogComponent.density}
            onChange={this.onChangeFogDensity}
            displayPrecision={0.00001}
          />
        )}
      </NodeEditor>
    )
  }
}

export default withTranslation()(FogEditor)
