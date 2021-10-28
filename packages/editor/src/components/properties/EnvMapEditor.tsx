import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import React from 'react'
import { Color } from 'three'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import ImageInput from '../inputs/ImageInput'
import { EnvMapComponent } from '@xrengine/engine/src/scene/components/EnvMapComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapSourceOptions = [
  {
    label: 'Default',
    value: EnvMapSourceType.Default
  },
  {
    label: 'Texture',
    value: EnvMapSourceType.Texture
  },
  {
    label: 'Color',
    value: EnvMapSourceType.Color
  }
]

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapTextureOptions = [
  {
    label: 'Cubemap',
    value: EnvMapTextureType.Cubemap
  },
  {
    label: 'Equirectangular',
    value: EnvMapTextureType.Equirectangular
  }
]

/**
 * SceneNodeEditor provides the editor view for property customization.
 *
 * @author Robert Long
 * @param       props
 * @constructor
 */
export class EnvMapEditor extends React.Component<{node: any}> {
  onChangeEnvmapSourceType = (envMapSourceType) => {
    const envMapComponent = getComponent(this.props.node.eid, EnvMapComponent)
    envMapComponent.envMapSourceType = envMapSourceType
    this.forceUpdate()
  }

  onChangeEnvmapTextureType = (envMapTextureType) => {
    const envMapComponent = getComponent(this.props.node.eid, EnvMapComponent)
    envMapComponent.envMapTextureType = envMapTextureType
    this.forceUpdate()
  }

  onChangeEnvmapColorSource = (envMapSourceColor) => {
    const envMapComponent = getComponent(this.props.node.eid, EnvMapComponent)
    envMapComponent.envMapSourceColor = envMapSourceColor
    this.forceUpdate()
  }

  onChangeEnvmapURLSource = (envMapSourceURL) => {
    const envMapComponent = getComponent(this.props.node.eid, EnvMapComponent)
    envMapComponent.envMapSourceURL = envMapSourceURL
    this.forceUpdate()
  }

  onChangeEnvmapIntensity = (envMapIntensity) => {
    const envMapComponent = getComponent(this.props.node.eid, EnvMapComponent)
    envMapComponent.envMapIntensity = envMapIntensity
    this.forceUpdate()
  }

  render() {
    const envMapComponent = getComponent(this.props.node.eid, EnvMapComponent)

    return (
      <NodeEditor {...this.props}>
        <InputGroup name="Envmap Source" label="Envmap Source">
          <SelectInput options={EnvMapSourceOptions} value={envMapComponent.envMapSourceType} onChange={this.onChangeEnvmapSourceType} />
        </InputGroup>
        {envMapComponent.envMapSourceType === EnvMapSourceType.Color && (
          <InputGroup name="EnvMapColor" label="EnvMap Color">
            <ColorInput value={new Color(envMapComponent.envMapSourceColor)} onChange={this.onChangeEnvmapColorSource} />
          </InputGroup>
        )}
        {envMapComponent.envMapSourceType === EnvMapSourceType.Texture && (
          <div>
            <InputGroup name="Texture Type" label="Texture Type">
              <SelectInput
                options={EnvMapTextureOptions}
                value={envMapComponent.envMapTextureType}
                onChange={this.onChangeEnvmapTextureType}
              />
            </InputGroup>
            <InputGroup name="Texture URL" label="Texture URL">
              <ImageInput value={envMapComponent.envMapSourceURL} onChange={this.onChangeEnvmapURLSource} />
              {envMapComponent.errorInEnvmapURL && <div>Error Loading From URL </div>}
            </InputGroup>
          </div>
        )}

        <InputGroup name="EnvMap Intensity" label="EnvMap Intensity">
          <CompoundNumericInput min={0} max={20} value={envMapComponent.envMapIntensity} onChange={this.onChangeEnvmapIntensity} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default EnvMapEditor
