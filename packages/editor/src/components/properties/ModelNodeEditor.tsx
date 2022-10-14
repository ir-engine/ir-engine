import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Object3D } from 'three'

import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { EquippableComponent } from '@xrengine/engine/src/interaction/components/EquippableComponent'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

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
  const [isEquippable, setEquippable] = useState(hasComponent(props.node.entity, EquippableComponent))
  const engineState = useEngineState()
  const entity = props.node.entity
  const modelState = getComponent(entity, ModelComponent)
  const modelComponent = modelState.value
  const obj3d = modelComponent.scene ?? new Object3D() //getComponent(entity, Object3DComponent)?.value ?? new Object3D() // quick hack to not crash
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
      removeComponent(props.node.entity, EquippableComponent)
      setEquippable(false)
    } else {
      addComponent(props.node.entity, EquippableComponent, true)
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
    <NodeEditor
      name={t('editor:properties.model.title')}
      description={t('editor:properties.model.description')}
      {...props}
    >
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={modelComponent.src} onChange={updateProperty(ModelComponent, 'src')} />
        {hasError && errorComponent?.srcError && (
          <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
        )}
      </InputGroup>
      <InputGroup name="Generate BVH" label={t('editor:properties.model.lbl-generateBVH')}>
        <BooleanInput value={modelComponent.generateBVH} onChange={updateProperty(ModelComponent, 'generateBVH')} />
      </InputGroup>
      <InputGroup name="MatrixAutoUpdate" label={t('editor:properties.model.lbl-matrixAutoUpdate')}>
        <BooleanInput
          value={modelComponent.matrixAutoUpdate}
          onChange={updateProperty(ModelComponent, 'matrixAutoUpdate')}
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
      <ShadowProperties node={props.node} />
      <ModelTransformProperties modelComponent={modelComponent} onChangeModel={updateProperty(ModelComponent, 'src')} />
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
