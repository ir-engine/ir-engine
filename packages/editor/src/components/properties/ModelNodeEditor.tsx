import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Object3D } from 'three'

import { AnimationManager } from '@etherealengine/engine/src/avatar/AnimationManager'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { EquippableComponent } from '@etherealengine/engine/src/interaction/components/EquippableComponent'
import { ErrorComponent, getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'

import ViewInArIcon from '@mui/icons-material/ViewInAr'

import exportGLTF from '../../functions/exportGLTF'
import BooleanInput from '../inputs/BooleanInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import Well from '../layout/Well'
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
  const [isEquippable, setEquippable] = useState(hasComponent(props.entity, EquippableComponent))

  const entity = props.entity
  const modelComponent = useComponent(entity, ModelComponent)
  const [exporting, setExporting] = useState(false)
  const [exportPath, setExportPath] = useState(modelComponent?.src.value)

  if (!modelComponent) return <></>
  const errors = getEntityErrors(props.entity, ModelComponent)
  const obj3d = modelComponent.value.scene

  const loopAnimationComponent = getOptionalComponent(entity, LoopAnimationComponent)

  const textureOverrideEntities = [] as { label: string; value: string }[]
  traverseEntityNode(Engine.instance.currentScene.sceneEntity, (node) => {
    if (entity === entity) return

    textureOverrideEntities.push({
      label: getComponent(entity, NameComponent) ?? getComponent(entity, UUIDComponent),
      value: getComponent(entity, UUIDComponent)
    })
  })

  const onChangeEquippable = () => {
    if (isEquippable) {
      removeComponent(props.entity, EquippableComponent)
      setEquippable(false)
    } else {
      addComponent(props.entity, EquippableComponent, true)
      setEquippable(true)
    }
  }

  const animations = loopAnimationComponent?.hasAvatarAnimations
    ? AnimationManager.instance._animations
    : obj3d?.animations ?? []

  const animationOptions = [{ label: 'None', value: -1 }]
  if (animations?.length) animations.forEach((clip, i) => animationOptions.push({ label: clip.name, value: i }))

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
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={modelComponent.src.value} onChange={updateProperty(ModelComponent, 'src')} />
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
        <BooleanInput value={isEquippable} onChange={onChangeEquippable} />
      </InputGroup>
      <InputGroup name="Loop Animation" label={t('editor:properties.model.lbl-loopAnimation')}>
        <SelectInput
          key={props.entity}
          options={animationOptions}
          value={loopAnimationComponent?.activeClipIndex}
          onChange={updateProperty(LoopAnimationComponent, 'activeClipIndex')}
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
      <ModelTransformProperties modelState={modelComponent} onChangeModel={(val) => modelComponent.src.set(val)} />
      {!exporting && modelComponent.src.value && (
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
