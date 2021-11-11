import { Cube } from '@styled-icons/fa-solid/Cube'
import ModelNode from '../../nodes/ModelNode'
import i18n from 'i18next'
import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation, withTranslation } from 'react-i18next'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { Object3D } from 'three'
import InteractableGroup from '../inputs/InteractableGroup'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

/**
 * Declaring properties for ModalNodeEditor component.
 *
 * @author Robert Long
 * @type {Object}
 */
type ModelNodeEditorProps = {
  node?: any
  multiEdit?: boolean
  t: Function
}

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export const ModelNodeEditor = (props: ModelNodeEditorProps) => {
  let [options, setOptions] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    const options = []
    const sceneNode = SceneManager.instance.scene
    sceneNode.traverse((o) => {
      if (o.isNode && o !== sceneNode && o.nodeName === 'Game') {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName })
      }
    })
    setOptions(options)
  }, [])

  const onChangeGPUInstancingFlag = (isUsingGPUInstancing) => {
    CommandManager.instance.setPropertyOnSelection('isUsingGPUInstancing', isUsingGPUInstancing)
  }

  //function to handle change in property src
  const onChangeSrc = (src, initialProps) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: { ...initialProps, src }
    })
  }

  // TODO
  // function to handle change in property src
  // onChangeEnvMap = (src, initialProps) => {
  //   CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, { properties: { ...initialProps, src } })
  // };

  //fucntion to handle changes in activeChipIndex property
  const onChangeAnimation = (activeClipIndex) => {
    CommandManager.instance.setPropertyOnSelection('activeClipIndex', activeClipIndex)
  }

  const onChangeAnimationSource = (hasAvatarAnimations) => {
    CommandManager.instance.setPropertyOnSelection('hasAvatarAnimations', hasAvatarAnimations)
    props.node.reload()
  }

  //function to handle change in collidable property
  // not currently in use, used by floor plan
  // onChangeCollidable = collidable => {
  //   CommandManager.instance.setPropertyOnSelection("collidable", collidable);
  // };

  const onChangeTextureOverride = (textureOverride) => {
    CommandManager.instance.setPropertyOnSelection('textureOverride', textureOverride)
  }

  // function to handle changes in walkable property
  // not currently in use, used by floor plan
  // onChangeWalkable = walkable => {
  //   CommandManager.instance.setPropertyOnSelection("walkable", walkable);
  // };

  // function to handle changes in castShadow property
  const onChangeCastShadow = (castShadow) => {
    CommandManager.instance.setPropertyOnSelection('castShadow', castShadow)
  }

  // function to handle changes in Receive shadow property
  const onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
  }

  // function to handle changes in interactable property
  const onChangeInteractable = (interactable) => {
    CommandManager.instance.setPropertyOnSelection('interactable', interactable)
  }

  // function to handle change in matrixAutoUpdate property
  const onChangeUpdateDataMatrix = (matrixAutoUpdate) => {
    CommandManager.instance.setPropertyOnSelection('_matrixAutoUpdate', matrixAutoUpdate)
  }

  // function to handle changes in payloadName property
  const onChangeRole = (role, selected) => {
    CommandManager.instance.setPropertyOnSelection('role', selected.label)
  }

  // function to handle changes in isAnimationPropertyDisabled
  const isAnimationPropertyDisabled = () => {
    const { multiEdit, node } = props
    if (multiEdit) {
      return CommandManager.instance.selected.some((selectedNode) => selectedNode.src !== node.src)
    }
    return false
  }

  // rendering view of ModelNodeEditor

  const node = props.node
  return (
    <NodeEditor description={ModelNodeEditor.description} {...props}>
      <InputGroup name="Model Url" label={t('editor:properties.model.lbl-modelurl')}>
        <ModelInput value={node.src} onChange={onChangeSrc} />
        {!(props.node as ModelNode).isValidURL && <div>{t('editor:properties.model.error-url')}</div>}
      </InputGroup>

      {/* TODO: implement environment map overrides. - source from scene env map, a custom BPCEM bake, URL string
         <InputGroup name="Environment Map" label={t('editor:properties.model.lbl-modelurl')}>
          <ModelInput value={node.src} onChange={onChangeSrc} />
          {!(props.node as ModelNode).isValidURL && <div>{t('editor:properties.model.error-url')}</div>}
        </InputGroup> */}
      <InputGroup name="Loop Animation" label={t('editor:properties.model.lbl-loopAnimation')}>
        <SelectInput
          disabled={isAnimationPropertyDisabled()}
          options={node.getClipOptions()}
          value={node.activeClipIndex}
          onChange={onChangeAnimation}
        />
      </InputGroup>
      <InputGroup name="Is Avatar" label={t('editor:properties.model.lbl-isAvatar')}>
        <BooleanInput value={node.hasAvatarAnimations} onChange={onChangeAnimationSource} />
      </InputGroup>
      {/* <InputGroup name="Collidable" label={t('editor:properties.model.lbl-collidable')}>
          // === not currently in use, used by floor plan === //
          <BooleanInput
            value={node.collidable}
            onChange={onChangeCollidable}
          />
        </InputGroup> */}
      <InputGroup name="Texture Override" label={t('editor:properties.model.lbl-textureOverride')}>
        <SelectInput
          options={SceneManager.instance.scene.children.map((obj: Object3D) => {
            return {
              label: obj.name,
              value: obj.uuid
            }
          })}
          value={node.textureOverride}
          onChange={onChangeTextureOverride}
        />
      </InputGroup>
      {/* <InputGroup name="Walkable" label={t('editor:properties.model.lbl-walkable')}>
            // === not currently in use, used by floor plan === //
            <BooleanInput
            value={node.walkable}
            onChange={onChangeWalkable}
          />
        </InputGroup> */}
      <InputGroup name="Cast Shadow" label={t('editor:properties.model.lbl-castShadow')}>
        <BooleanInput value={node.castShadow} onChange={onChangeCastShadow} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.model.lbl-receiveShadow')}>
        <BooleanInput value={node.receiveShadow} onChange={onChangeReceiveShadow} />
      </InputGroup>
      <InputGroup name="Interactable" label={t('editor:properties.model.lbl-interactable')}>
        <BooleanInput value={node.interactable} onChange={onChangeInteractable} />
      </InputGroup>
      <InputGroup name="MatrixAutoUpdate" label={t('editor:properties.model.lbl-matrixAutoUpdate')}>
        <BooleanInput value={node._matrixAutoUpdate} onChange={onChangeUpdateDataMatrix} />
      </InputGroup>
      {node.interactable && <InteractableGroup node={node}></InteractableGroup>}
    </NodeEditor>
  )
}

ModelNodeEditor.description = i18n.t('editor:properties.model.description')
ModelNodeEditor.iconComponent = Cube

export default ModelNodeEditor
