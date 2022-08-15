import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PreventBakeTagComponent } from '@xrengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneDynamicLoadTagComponent } from '@xrengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { SCENE_COMPONENT_DYNAMIC_LOAD } from '@xrengine/engine/src/scene/functions/loaders/DynamicLoadFunctions'
import { SCENE_COMPONENT_PREVENT_BAKE } from '@xrengine/engine/src/scene/functions/loaders/PreventBakeFunctions'
import { SCENE_COMPONENT_VISIBLE } from '@xrengine/engine/src/scene/functions/loaders/VisibleFunctions'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import EditorCommands from '../../constants/EditorCommands'
import { getNodeEditorsForEntity } from '../../functions/PrefabEditors'
import { useSelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import NameInputGroup from './NameInputGroup'
import Object3DNodeEditor from './Object3DNodeEditor'
import { updateProperty } from './Util'

const StyledNodeEditor = (styled as any).div`
`

/**
 * PropertiesHeader used as a wrapper for NameInputGroupContainer component.
 */
const PropertiesHeader = (styled as any).div`
  border: none !important;
  padding-bottom: 0 !important;
`

/**
 * NameInputGroupContainer used to provides styles and contains NameInputGroup and VisibleInputGroup.
 *
 *  @type {Styled Component}
 */
const NameInputGroupContainer = (styled as any).div`
`
/**
 * Styled component used to provide styles for visiblity checkbox.
 */
const VisibleInputGroup = (styled as any)(InputGroup)`
  & > label {
    width: auto !important;
  }
`

/**
 * PropertiesPanelContent used as container element contains content of editor view.
 * @type {Styled Component}
 */
const PropertiesPanelContent = (styled as any).div`
  overflow-y: auto;
  height: 100%;
`

/**
 * NoNodeSelectedMessage used to show the message when no selected no is there.
 *
 * @type {Styled component}
 */
const NoNodeSelectedMessage = (styled as any).div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--textColor);
`

/**
 * PropertiesPanelContainer used to render editor view to customize property of selected element.
 *
 * @extends Component
 */
export const PropertiesPanelContainer = () => {
  const selectionState = useSelectionState()
  const selectedEntities = selectionState.selectedEntities.value
  const { t } = useTranslation()

  // access state to detect the change
  selectionState.objectChangeCounter.value

  const onChangeDynamicLoad = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.TAG_COMPONENT,
      operations: [
        {
          component: SceneDynamicLoadTagComponent,
          sceneComponentName: SCENE_COMPONENT_DYNAMIC_LOAD,
          type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
        }
      ]
    })
  }

  const onChangeVisible = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.TAG_COMPONENT,
      operations: [
        {
          component: VisibleComponent,
          sceneComponentName: SCENE_COMPONENT_VISIBLE,
          type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
        }
      ]
    })
  }

  const onChangeBakeStatic = (value) => {
    executeCommandWithHistoryOnSelection({
      type: EditorCommands.TAG_COMPONENT,
      operations: [
        {
          component: PreventBakeTagComponent,
          sceneComponentName: SCENE_COMPONENT_PREVENT_BAKE,
          type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
        }
      ]
    })
  }

  //rendering editor views for customization of element properties
  let content
  const multiEdit = selectedEntities.length > 1
  const nodeEntity = selectedEntities[selectedEntities.length - 1]
  const isObject3D = typeof nodeEntity === 'string'
  const node = isObject3D
    ? Engine.instance.currentWorld.scene.getObjectByProperty('uuid', nodeEntity)
    : Engine.instance.currentWorld.entityTree.entityNodeMap.get(nodeEntity)

  if (!nodeEntity || !node) {
    content = <NoNodeSelectedMessage>{t('editor:properties.noNodeSelected')}</NoNodeSelectedMessage>
  } else {
    // get all editors that this entity has a component for
    const editors = isObject3D ? [Object3DNodeEditor] : getNodeEditorsForEntity(nodeEntity)

    content = (
      <StyledNodeEditor>
        {!isObject3D && (
          <PropertiesHeader>
            <NameInputGroupContainer>
              <NameInputGroup node={node as EntityTreeNode} key={nodeEntity} />
              {!hasComponent(nodeEntity, SceneTagComponent) && (
                <>
                  <VisibleInputGroup name="Dynamic Load" label={t('editor:properties.lbl-dynamicLoad')}>
                    <BooleanInput
                      value={hasComponent(nodeEntity, SceneDynamicLoadTagComponent)}
                      onChange={onChangeDynamicLoad}
                    />
                    {hasComponent(nodeEntity, SceneDynamicLoadTagComponent) && (
                      <CompoundNumericInput
                        style={{ paddingLeft: `8px`, paddingRight: `8px` }}
                        min={1}
                        max={100}
                        step={1}
                        value={getComponent(nodeEntity, SceneDynamicLoadTagComponent).distance}
                        onChange={updateProperty(SceneDynamicLoadTagComponent, 'distance')}
                      />
                    )}
                  </VisibleInputGroup>
                  <VisibleInputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
                    <BooleanInput value={hasComponent(nodeEntity, VisibleComponent)} onChange={onChangeVisible} />
                  </VisibleInputGroup>
                  <VisibleInputGroup name="Prevent Baking" label={t('editor:properties.lbl-preventBake')}>
                    <BooleanInput
                      value={hasComponent(nodeEntity, PreventBakeTagComponent)}
                      onChange={onChangeBakeStatic}
                    />
                  </VisibleInputGroup>
                </>
              )}
            </NameInputGroupContainer>
          </PropertiesHeader>
        )}
        {editors.map((Editor, i) => (
          <Editor key={i} multiEdit={multiEdit} node={node as EntityTreeNode} />
        ))}
      </StyledNodeEditor>
    )
  }

  return <PropertiesPanelContent>{content}</PropertiesPanelContent>
}

export default PropertiesPanelContainer
