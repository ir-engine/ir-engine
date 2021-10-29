import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import React, { useState, useCallback } from 'react'
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
const EnvMapEditor = (node: any) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onChangeEnvmapSourceType = (envMapSourceType) => {
    const envMapComponent = getComponent(node.eid, EnvMapComponent)
    envMapComponent.envMapSourceType = envMapSourceType
    forceUpdate()
  }

  const onChangeEnvmapTextureType = (envMapTextureType) => {
    const envMapComponent = getComponent(node.eid, EnvMapComponent)
    envMapComponent.envMapTextureType = envMapTextureType
    forceUpdate()
  }

  const onChangeEnvmapColorSource = (envMapSourceColor) => {
    const envMapComponent = getComponent(node.eid, EnvMapComponent)
    envMapComponent.envMapSourceColor = envMapSourceColor
    forceUpdate()
  }

  const onChangeEnvmapURLSource = (envMapSourceURL) => {
    const envMapComponent = getComponent(node.eid, EnvMapComponent)
    envMapComponent.envMapSourceURL = envMapSourceURL
    forceUpdate()
  }

  const onChangeEnvmapIntensity = (envMapIntensity) => {
    const envMapComponent = getComponent(node.eid, EnvMapComponent)
    envMapComponent.envMapIntensity = envMapIntensity
    forceUpdate()
  }

  const envMapComponent = getComponent(node.eid, EnvMapComponent)

  return (
    <NodeEditor node={node}>
      <InputGroup name="Envmap Source" label="Envmap Source">
        <SelectInput
          options={EnvMapSourceOptions}
          value={envMapComponent.envMapSourceType}
          onChange={onChangeEnvmapSourceType}
        />
      </InputGroup>
      {envMapComponent.envMapSourceType === EnvMapSourceType.Color && (
        <InputGroup name="EnvMapColor" label="EnvMap Color">
          <ColorInput value={new Color(envMapComponent.envMapSourceColor)} onChange={onChangeEnvmapColorSource} />
        </InputGroup>
      )}
      {envMapComponent.envMapSourceType === EnvMapSourceType.Texture && (
        <div>
          <InputGroup name="Texture Type" label="Texture Type">
            <SelectInput
              options={EnvMapTextureOptions}
              value={envMapComponent.envMapTextureType}
              onChange={onChangeEnvmapTextureType}
            />
          </InputGroup>
          <InputGroup name="Texture URL" label="Texture URL">
            <ImageInput value={envMapComponent.envMapSourceURL} onChange={onChangeEnvmapURLSource} />
            {envMapComponent.errorInEnvmapURL && <div>Error Loading From URL </div>}
          </InputGroup>
        </div>
      )}

      <InputGroup name="EnvMap Intensity" label="EnvMap Intensity">
        <CompoundNumericInput
          min={0}
          max={20}
          value={envMapComponent.envMapIntensity}
          onChange={onChangeEnvmapIntensity}
        />
      </InputGroup>
    </NodeEditor>
  )
}

export default EnvMapEditor
