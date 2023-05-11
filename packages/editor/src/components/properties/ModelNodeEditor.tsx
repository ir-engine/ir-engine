import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  DefaultModelTransformParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { AnimationManager } from '@etherealengine/engine/src/avatar/AnimationManager'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import {
  addComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EquippableComponent } from '@etherealengine/engine/src/interaction/components/EquippableComponent'
import { CallbackComponent, getCallback } from '@etherealengine/engine/src/scene/components/CallbackComponent'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { addError, clearErrors } from '@etherealengine/engine/src/scene/functions/ErrorFunctions'
import { State, useState } from '@etherealengine/hyperflux'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import exportGLTF from '../../functions/exportGLTF'
import { convertToScaffold, createLODsFromModel } from '../../functions/lodsFromModel'
import { LODsFromModelParameters } from '../../functions/lodsFromModel'
import { StaticResourceService } from '../../services/StaticResourceService'
import BooleanInput from '../inputs/BooleanInput'
import { Button, PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import PaginatedList from '../layout/PaginatedList'
import Well from '../layout/Well'
import GLTFTransformProperties from './GLTFTransformProperties'
import ModelTransformProperties from './ModelTransformProperties'
import NodeEditor from './NodeEditor'
import ScreenshareTargetNodeEditor from './ScreenshareTargetNodeEditor'
import ShadowProperties from './ShadowProperties'
import { EditorComponentType, updateProperties, updateProperty } from './Util'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @type {class component}
 */
export const ModelNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const isEquippable = useState(hasComponent(props.entity, EquippableComponent))

  const entity = props.entity
  const modelComponent = useComponent(entity, ModelComponent)
  const exporting = useState(false)
  const exportPath = useState(modelComponent?.src.value)

  if (!modelComponent) return <></>
  const errors = getEntityErrors(props.entity, ModelComponent)

  const loopAnimationComponent = getOptionalComponent(entity, LoopAnimationComponent)

  const lodParms = useState<LODsFromModelParameters>(() => ({
    serialize: false,
    levels: []
  }))

  const onChangeEquippable = useCallback(() => {
    if (isEquippable.value) {
      removeComponent(props.entity, EquippableComponent)
      isEquippable.set(false)
    } else {
      addComponent(props.entity, EquippableComponent, true)
      isEquippable.set(true)
    }
  }, [entity])

  const animationOptions = useState(() => {
    const obj3d = modelComponent.value.scene
    const animations = loopAnimationComponent?.hasAvatarAnimations
      ? AnimationManager.instance._animations
      : obj3d?.animations ?? []
    return [{ label: 'None', value: -1 }, ...animations.map((clip, index) => ({ label: clip.name, value: index }))]
  })

  const onExportModel = useCallback(() => {
    if (exporting.value) {
      console.warn('already exporting')
      return
    }
    exporting.set(true)
    exportGLTF(entity, exportPath.value).then(() => exporting.set(false))
  }, [])

  const updateResources = useCallback((path: string) => {
    clearErrors(entity, ModelComponent)
    try {
      StaticResourceService.uploadModel(path).then((model) => {
        updateProperty(ModelComponent, 'resource')(model)
        updateProperty(ModelComponent, 'src')(path)
      })
    } catch (err) {
      console.log('Error getting path', path)
      addError(entity, ModelComponent, 'INVALID_URL', path)
      return {}
    }
  }, [])

  const onChangePlayingAnimation = (index) => {
    updateProperties(LoopAnimationComponent, {
      activeClipIndex: index
    })
    getCallback(props.entity, 'xre.play')!()
  }

  const onAddLODLevel = useCallback(() => {
    lodParms.levels[lodParms.levels.length].set({
      ...DefaultModelTransformParameters
    })
  }, [])

  return (
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput
          value={
            modelComponent.resource?.value?.glbStaticResource?.LOD0_url ||
            modelComponent.resource?.value?.gltfStaticResource?.LOD0_url ||
            modelComponent.resource?.value?.fbxStaticResource?.LOD0_url ||
            modelComponent.resource?.value?.usdzStaticResource?.LOD0_url ||
            modelComponent.src?.value
          }
          onChange={updateResources}
        />
        {errors?.LOADING_ERROR && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
        )}
      </InputGroup>
      <InputGroup name="Generate BVH" label={t('editor:properties.model.lbl-generateBVH')}>
        <BooleanInput
          value={modelComponent.generateBVH.value}
          onChange={updateProperty(ModelComponent, 'generateBVH')}
        />
      </InputGroup>
      <InputGroup name="Avoid Camera Occlusion" label={t('editor:properties.model.lbl-avoidCameraOcclusion')}>
        <BooleanInput
          value={modelComponent.avoidCameraOcclusion.value}
          onChange={updateProperty(ModelComponent, 'avoidCameraOcclusion')}
        />
      </InputGroup>
      <InputGroup name="Is Equippable" label={t('editor:properties.model.lbl-isEquippable')}>
        <BooleanInput value={isEquippable.value} onChange={onChangeEquippable} />
      </InputGroup>
      <InputGroup name="Loop Animation" label={t('editor:properties.model.lbl-loopAnimation')}>
        <SelectInput
          key={props.entity}
          options={animationOptions.value}
          value={loopAnimationComponent?.activeClipIndex}
          onChange={onChangePlayingAnimation}
        />
      </InputGroup>
      <InputGroup name="Is Avatar" label={t('editor:properties.model.lbl-isAvatar')}>
        <BooleanInput
          value={!!loopAnimationComponent?.hasAvatarAnimations}
          onChange={updateProperty(LoopAnimationComponent, 'hasAvatarAnimations')}
        />
      </InputGroup>
      <ScreenshareTargetNodeEditor entity={props.entity} multiEdit={props.multiEdit} />
      <ShadowProperties entity={props.entity} />
      <CollapsibleBlock label={t('editor:properties.model.lods.label')}>
        <div className="bg-gradient-to-b from-blue-gray-400 to-cool-gray-800 rounded-lg shadow-lg">
          <div className="px-4 py-2 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-100">LODs</h2>
          </div>
          <InputGroup name="Serialize" label={t('editor:properties.model.lods.serialize')}>
            <BooleanInput value={lodParms.value.serialize} onChange={lodParms.serialize.set} />
          </InputGroup>
          <InputGroup name="LOD Level Parameters" label={t('editor:properties.model.lods.lodLevelParameters')}>
            <Button onClick={onAddLODLevel}>Add LOD Level</Button>
          </InputGroup>
          <PaginatedList
            list={lodParms.levels}
            element={(lodLevel: State<ModelTransformParameters>) => {
              return <GLTFTransformProperties transformParms={lodLevel} onChange={lodLevel.set} />
            }}
          />
          <div className="p-4">
            <Button onClick={convertToScaffold.bind({}, entity)}>Convert to Scaffold</Button>
          </div>
          <div className="p-4">
            <Button onClick={createLODsFromModel.bind({}, entity, lodParms.value)}>
              {t('editor:properties.model.lods.generate')}
            </Button>
          </div>
        </div>
      </CollapsibleBlock>
      <ModelTransformProperties modelState={modelComponent} onChangeModel={(val) => modelComponent.src.set(val)} />
      {!exporting.value && modelComponent.src.value && (
        <Well>
          <ModelInput value={exportPath.value} onChange={exportPath.set} />
          <PropertiesPanelButton onClick={onExportModel}>Save Changes</PropertiesPanelButton>
        </Well>
      )}
      {exporting.value && <p>Exporting...</p>}
    </NodeEditor>
  )
}

ModelNodeEditor.iconComponent = ViewInArIcon

export default ModelNodeEditor
