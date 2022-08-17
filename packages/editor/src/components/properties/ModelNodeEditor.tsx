import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Object3D } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import exportModelGLTF from '@xrengine/engine/src/assets/functions/exportModelGLTF'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { EquippableComponent } from '@xrengine/engine/src/interaction/components/EquippableComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { SCENE_COMPONENT_EQUIPPABLE } from '@xrengine/engine/src/scene/functions/loaders/EquippableFunctions'
import { playAnimationClip } from '@xrengine/engine/src/scene/functions/loaders/LoopAnimationFunctions'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import exportGLTF from '../../functions/exportGLTF'
import BooleanInput from '../inputs/BooleanInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import MaterialAssignment from '../inputs/MaterialAssignment'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import Well from '../layout/Well'
import EnvMapEditor from './EnvMapEditor'
import ModelTransformProperties from './ModelTransformProperties'
import NodeEditor from './NodeEditor'
import ScreenshareTargetNodeEditor from './ScreenshareTargetNodeEditor'
import ShadowProperties from './ShadowProperties'
import { EditorComponentType, updateProperty } from './Util'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @type {class component}
 */
export const ModelNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isEquippable, setEquippable] = useState(hasComponent(props.node.entity, EquippableComponent))
  const engineState = useEngineState()
  const entity = props.node.entity

  const modelComponent = getComponent(entity, ModelComponent)
  const animationComponent = getComponent(entity, AnimationComponent)
  const obj3d = getComponent(entity, Object3DComponent)?.value ?? new Object3D() // quick hack to not crash
  const hasError = engineState.errorEntities[entity].get()
  const errorComponent = getComponent(entity, ErrorComponent)

  const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)

  const textureOverrideEntities = [] as { label: string; value: string }[]
  traverseEntityNode(Engine.instance.currentWorld.entityTree.rootNode, (node) => {
    if (node.entity === entity) return

    textureOverrideEntities.push({
      label: hasComponent(node.entity, NameComponent) ? getComponent(node.entity, NameComponent).name : node.uuid,
      value: node.uuid
    })
  })

  const onChangeEquippable = () => {
    if (isEquippable) {
      const editorComponent = getComponent(entity, EntityNodeComponent).components
      editorComponent.splice(editorComponent.indexOf(SCENE_COMPONENT_EQUIPPABLE), 1)
      removeComponent(props.node.entity, EquippableComponent)
      setEquippable(false)
    } else {
      addComponent(props.node.entity, EquippableComponent, true)
      getComponent(entity, EntityNodeComponent).components.push(SCENE_COMPONENT_EQUIPPABLE)
      setEquippable(true)
    }
  }

  const animations = loopAnimationComponent?.hasAvatarAnimations
    ? AnimationManager.instance._animations
    : obj3d.animations ?? []

  const animationOptions = [{ label: 'None', value: -1 }]
  if (animations?.length) animations.forEach((clip, i) => animationOptions.push({ label: clip.name, value: i }))

  const [exporting, setExporting] = useState(false)
  const [exportPath, setExportPath] = useState(modelComponent.src)
  const onExportModel = async () => {
    if (exporting) {
      console.warn('already exporting')
      return
    }
    setExporting(true)
    await exportGLTF(entity, exportPath)
    setExporting(false)
  }

  return (
    <NodeEditor description={t('editor:properties.model.description')} {...props}>
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={modelComponent.src} onChange={updateProperty(ModelComponent, 'src')} />
        {hasError && errorComponent?.srcError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
        )}
      </InputGroup>
      {modelComponent.parsed && (
        <ModelTransformProperties
          modelComponent={modelComponent}
          onChangeModel={updateProperty(ModelComponent, 'src')}
        />
      )}
      <MaterialAssignment
        entity={entity}
        node={props.node}
        modelComponent={modelComponent}
        values={modelComponent.materialOverrides}
        onChange={updateProperty(ModelComponent, 'materialOverrides')}
      />
      <InputGroup name="Generate BVH" label={t('editor:properties.model.lbl-generateBVH')}>
        <BooleanInput value={modelComponent.generateBVH} onChange={updateProperty(ModelComponent, 'generateBVH')} />
      </InputGroup>
      <InputGroup name="MatrixAutoUpdate" label={t('editor:properties.model.lbl-matrixAutoUpdate')}>
        <BooleanInput
          value={modelComponent.matrixAutoUpdate}
          onChange={updateProperty(ModelComponent, 'matrixAutoUpdate')}
        />
      </InputGroup>
      <InputGroup name="Use Basic Materials" label={t('editor:properties.model.lbl-useBasicMaterials')}>
        <BooleanInput
          value={modelComponent.useBasicMaterial}
          onChange={updateProperty(ModelComponent, 'useBasicMaterial')}
        />
      </InputGroup>
      <InputGroup name="Is Using GPU Instancing" label={t('editor:properties.model.lbl-isGPUInstancing')}>
        <BooleanInput
          value={modelComponent.isUsingGPUInstancing}
          onChange={updateProperty(ModelComponent, 'isUsingGPUInstancing')}
        />
      </InputGroup>
      <InputGroup name="Is Equippable" label={t('editor:properties.model.lbl-isEquippable')}>
        <BooleanInput value={isEquippable} onChange={onChangeEquippable} />
      </InputGroup>
      <InputGroup name="Loop Animation" label={t('editor:properties.model.lbl-loopAnimation')}>
        <SelectInput
          key={props.node.entity}
          options={animationOptions}
          value={loopAnimationComponent?.activeClipIndex}
          onChange={updateProperty(LoopAnimationComponent, 'activeClipIndex')}
        />
      </InputGroup>
      <InputGroup name="Is Avatar" label={t('editor:properties.model.lbl-isAvatar')}>
        <BooleanInput
          value={loopAnimationComponent?.hasAvatarAnimations}
          onChange={updateProperty(LoopAnimationComponent, 'hasAvatarAnimations')}
        />
      </InputGroup>
      <ScreenshareTargetNodeEditor node={props.node} multiEdit={props.multiEdit} />
      <EnvMapEditor node={props.node} />
      <ShadowProperties node={props.node} />
      {!exporting && modelComponent.src && (
        <Well>
          <ModelInput value={exportPath} onChange={setExportPath} />
          <PropertiesPanelButton onClick={onExportModel}>Save Changes</PropertiesPanelButton>
        </Well>
      )}
      {exporting && <p>Exporting...</p>}
    </NodeEditor>
  )
}

ModelNodeEditor.iconComponent = ViewInArIcon

export default ModelNodeEditor
