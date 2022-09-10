import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EnvmapComponent, SCENE_COMPONENT_ENVMAP } from '@xrengine/engine/src/scene/components/EnvmapComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import { deserializeEnvMap } from '@xrengine/engine/src/scene/functions/loaders/EnvMapFunctions'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import FolderInput from '../inputs/FolderInput'
import ImagePreviewInput from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapSourceOptions = Object.values(EnvMapSourceType).map((value) => {
  return { label: value, value }
})

/**
 * EnvMapSourceOptions array containing SourceOptions for Envmap
 */
const EnvMapTextureOptions = Object.values(EnvMapTextureType).map((value) => {
  return { label: value, value }
})

/**
 * EnvMapEditor provides the editor view for environment map property customization.
 *
 * @param       props
 * @constructor
 */
export const EnvMapEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const engineState = useEngineState()

  const onChangeCubemapURLSource = useCallback((value) => {
    const directory = value[value.length - 1] === '/' ? value.substring(0, value.length - 1) : value
    if (directory !== envmapComponent.envMapSourceURL) {
      setPropertyOnSelectionEntities({
        component: EnvmapComponent,
        properties: [{ envMapSourceURL: directory }]
      })
    }
  }, [])

  let envmapComponent = getComponent(entity, EnvmapComponent)

  // if component is not there for previously saved model entities then create one
  if (!envmapComponent) {
    deserializeEnvMap(props.node.entity, { name: SCENE_COMPONENT_ENVMAP, props: {} })
    envmapComponent = getComponent(entity, EnvmapComponent)
  }

  const hasError = engineState.errorEntities[entity].get()
  const errorComponent = getComponent(entity, ErrorComponent)

  return (
    <NodeEditor
      {...props}
      component={EnvmapComponent}
      name={t('editor:properties.envmap.name')}
      description={t('editor:properties.envmap.description')}
    >
      <InputGroup name="Envmap Source" label="Envmap Source">
        <SelectInput
          key={props.node.entity}
          options={EnvMapSourceOptions}
          value={envmapComponent.type}
          onChange={updateProperty(EnvmapComponent, 'type')}
        />
      </InputGroup>
      {envmapComponent.type === EnvMapSourceType.Color && (
        <InputGroup name="EnvMapColor" label="EnvMap Color">
          <ColorInput
            value={envmapComponent.envMapSourceColor}
            onChange={updateProperty(EnvmapComponent, 'envMapSourceColor')}
          />
        </InputGroup>
      )}
      {envmapComponent.type === EnvMapSourceType.Texture && (
        <div>
          <InputGroup name="Texture Type" label="Texture Type">
            <SelectInput
              key={props.node.entity}
              options={EnvMapTextureOptions}
              value={envmapComponent.envMapTextureType}
              onChange={updateProperty(EnvmapComponent, 'envMapTextureType')}
            />
          </InputGroup>
          <InputGroup name="Texture URL" label="Texture URL">
            {envmapComponent.envMapTextureType === EnvMapTextureType.Cubemap && (
              <FolderInput value={envmapComponent.envMapSourceURL} onChange={onChangeCubemapURLSource} />
            )}
            {envmapComponent.envMapTextureType === EnvMapTextureType.Equirectangular && (
              <ImagePreviewInput
                value={envmapComponent.envMapSourceURL}
                onChange={updateProperty(EnvmapComponent, 'envMapSourceURL')}
              />
            )}
            {hasError && errorComponent.envmapError && (
              <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.scene.error-url')}</div>
            )}
          </InputGroup>
        </div>
      )}

      {envmapComponent.type !== EnvMapSourceType.None && (
        <InputGroup name="EnvMap Intensity" label="EnvMap Intensity">
          <CompoundNumericInput
            min={0}
            max={20}
            value={envmapComponent.envMapIntensity}
            onChange={updateProperty(EnvmapComponent, 'envMapIntensity')}
          />
        </InputGroup>
      )}
    </NodeEditor>
  )
}

export default EnvMapEditor
