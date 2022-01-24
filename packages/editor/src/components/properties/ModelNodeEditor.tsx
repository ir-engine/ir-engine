import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import ModelInput from '../inputs/ModelInput'
import { getComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import { EditorComponentType, updateProperty } from './Util'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import ShadowProperties from './ShadowProperties'
import InteractableGroup from '../inputs/InteractableGroup'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import {
  deserializeInteractable,
  SCENE_COMPONENT_INTERACTABLE,
  SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES
} from '@xrengine/engine/src/scene/functions/loaders/InteractableFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export const ModelNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isInteractable, setInteractable] = useState(false)

  const modelComponent = getComponent(props.node.entity, ModelComponent)
  const obj3d = getComponent(props.node.entity, Object3DComponent).value

  useEffect(() => {
    setInteractable(hasComponent(props.node.entity, InteractableComponent))
  }, [])

  const onChangeInteractable = (interact) => {
    setInteractable(interact)
    if (interact) {
      deserializeInteractable(props.node.entity, { name: '', props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES })
    } else {
      const editorComponent = getComponent(props.node.entity, EntityNodeComponent).components
      editorComponent.splice(editorComponent.indexOf(SCENE_COMPONENT_INTERACTABLE), 1)
      removeComponent(props.node.entity, InteractableComponent)
    }
  }
  const loopAnimationComponent = getComponent(props.node.entity, LoopAnimationComponent)

  const textureOverrideEntities = [] as { label: string; value: string }[]
  useWorld().entityTree.traverse((node) => {
    if (node.entity === props.node.entity) return

    textureOverrideEntities.push({
      label: getComponent(node.entity, NameComponent).name,
      value: node.uuid
    })
  })

  const animations = loopAnimationComponent?.hasAvatarAnimations
    ? AnimationManager.instance._animations
    : obj3d.animations ?? []

  const animationOptions = [{ label: 'None', value: -1 }]
  if (animations?.length) animations.forEach((clip, i) => animationOptions.push({ label: clip.name, value: i }))
  return (
    <NodeEditor description={t('editor:properties.model.description')} {...props}>
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={modelComponent.src} onChange={updateProperty(ModelComponent, 'src')} />
        {modelComponent.error && <div style={{ color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>}
      </InputGroup>
      <InputGroup name="Environment Map" label={t('editor:properties.model.lbl-envmapUrl')}>
        <ModelInput value={modelComponent.envMapOverride} onChange={updateProperty(ModelComponent, 'envMapOverride')} />
        {modelComponent.errorEnvMapLoad && (
          <div style={{ color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
        )}
      </InputGroup>
      <InputGroup name="Texture Override" label={t('editor:properties.model.lbl-textureOverride')}>
        <SelectInput
          options={textureOverrideEntities}
          value={modelComponent.textureOverride}
          onChange={updateProperty(ModelComponent, 'textureOverride')}
        />
      </InputGroup>
      <InputGroup name="MatrixAutoUpdate" label={t('editor:properties.model.lbl-matrixAutoUpdate')}>
        <BooleanInput
          value={modelComponent.matrixAutoUpdate}
          onChange={updateProperty(ModelComponent, 'matrixAutoUpdate')}
        />
      </InputGroup>
      <InputGroup name="Is Using GPU Instancing" label={t('editor:properties.model.lbl-isGPUInstancing')}>
        <BooleanInput
          value={modelComponent.isUsingGPUInstancing}
          onChange={updateProperty(ModelComponent, 'isUsingGPUInstancing')}
        />
      </InputGroup>
      <InputGroup name="Is Dynamic" label={t('editor:properties.model.lbl-isDynamic')}>
        <BooleanInput
          value={modelComponent.isDynamicObject}
          onChange={updateProperty(ModelComponent, 'isDynamicObject')}
        />
      </InputGroup>

      <InputGroup name="Loop Animation" label={t('editor:properties.model.lbl-loopAnimation')}>
        <SelectInput
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
      <InputGroup name="Interactable" label={t('editor:properties.model.lbl-interactable')}>
        <BooleanInput value={isInteractable} onChange={onChangeInteractable} />
      </InputGroup>
      {isInteractable && <InteractableGroup node={props.node}></InteractableGroup>}
      <ShadowProperties node={props.node} />
    </NodeEditor>
  )
}

ModelNodeEditor.iconComponent = ViewInArIcon

export default ModelNodeEditor
