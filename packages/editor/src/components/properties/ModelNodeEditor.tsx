import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimationClip, Object3D } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { getComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import {
  deserializeInteractable,
  SCENE_COMPONENT_INTERACTABLE,
  SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES
} from '@xrengine/engine/src/scene/functions/loaders/InteractableFunctions'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import BooleanInput from '../inputs/BooleanInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import InteractableGroup from '../inputs/InteractableGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import EnvMapEditor from './EnvMapEditor'
import NodeEditor from './NodeEditor'
import ShadowProperties from './ShadowProperties'
import { EditorComponentType, updateProperty } from './Util'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export const ModelNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const [isInteractable, setInteractable] = useState(false)
  const [animationPlaying, setAnimationPlaying] = useState(false)
  const engineState = useEngineState()
  const entity = props.node.entity

  const modelComponent = getComponent(entity, ModelComponent)
  const animationComponent = getComponent(entity, AnimationComponent)
  const obj3d = getComponent(entity, Object3DComponent)?.value ?? new Object3D() // quick hack to not crash
  const hasError = engineState.errorEntities[entity].get()
  const errorComponent = getComponent(entity, ErrorComponent)

  useEffect(() => {
    setInteractable(hasComponent(entity, InteractableComponent))
  }, [])

  const updateSrc = async (src: string) => {
    // if(src !== modelComponent.src)
    AssetLoader.Cache.delete(src)
    await AssetLoader.loadAsync(src)
    updateProperty(ModelComponent, 'src')(src)
  }

  const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
  const onPlayAnimation = () => {
    if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
    if (!animationPlaying) {
      if (
        loopAnimationComponent.activeClipIndex >= 0 &&
        animationComponent.animations[loopAnimationComponent.activeClipIndex]
      ) {
        loopAnimationComponent.action = animationComponent.mixer
          .clipAction(
            AnimationClip.findByName(
              animationComponent.animations,
              animationComponent.animations[loopAnimationComponent.activeClipIndex].name
            )
          )
          .play()
      }
    }
    setAnimationPlaying(!animationPlaying)
  }

  const onChangeInteractable = (interact) => {
    setInteractable(interact)
    if (interact) {
      deserializeInteractable(entity, { name: '', props: SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES })
    } else {
      const editorComponent = getComponent(entity, EntityNodeComponent).components
      editorComponent.splice(editorComponent.indexOf(SCENE_COMPONENT_INTERACTABLE), 1)
      removeComponent(entity, InteractableComponent)
    }
  }

  const textureOverrideEntities = [] as { label: string; value: string }[]
  traverseEntityNode(useWorld().entityTree.rootNode, (node) => {
    if (node.entity === entity) return

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
        <ModelInput value={modelComponent.src} onChange={updateSrc} />
        {hasError && errorComponent?.srcError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
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
      <PropertiesPanelButton onClick={onPlayAnimation}>
        {t(animationPlaying ? 'editor:properties.video.lbl-pause' : 'editor:properties.video.lbl-play')}
      </PropertiesPanelButton>
      <InputGroup name="Interactable" label={t('editor:properties.model.lbl-interactable')}>
        <BooleanInput value={isInteractable} onChange={onChangeInteractable} />
      </InputGroup>
      {isInteractable && <InteractableGroup node={props.node}></InteractableGroup>}
      <EnvMapEditor node={props.node} />
      <ShadowProperties node={props.node} />
    </NodeEditor>
  )
}

ModelNodeEditor.iconComponent = ViewInArIcon

export default ModelNodeEditor
