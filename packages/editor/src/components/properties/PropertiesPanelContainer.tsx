import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { PreventBakeTagComponent } from '@xrengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneDynamicLoadTagComponent } from '@xrengine/engine/src/scene/components/SceneDynamicLoadTagComponent'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { SCENE_COMPONENT_DYNAMIC_LOAD } from '@xrengine/engine/src/scene/functions/loaders/DynamicLoadFunctions'
import { SCENE_COMPONENT_PERSIST } from '@xrengine/engine/src/scene/functions/loaders/PersistFunctions'
import { SCENE_COMPONENT_PREVENT_BAKE } from '@xrengine/engine/src/scene/functions/loaders/PreventBakeFunctions'
import { SCENE_COMPONENT_VISIBLE } from '@xrengine/engine/src/scene/functions/loaders/VisibleFunctions'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import EditorCommands from '../../constants/EditorCommands'
import { getNodeEditorsForEntity } from '../../functions/PrefabEditors'
import { useSelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NameInputGroup from './NameInputGroup'
import TransformPropertyGroup from './TransformPropertyGroup'

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
  const node = Engine.instance.currentWorld.entityTree.entityNodeMap.get(nodeEntity)

  if (!nodeEntity || !node) {
    content = <NoNodeSelectedMessage>{t('editor:properties.noNodeSelected')}</NoNodeSelectedMessage>
  } else {
    // get all editors that this entity has a component for
    const editors = getNodeEditorsForEntity(nodeEntity)
    const transform =
      hasComponent(nodeEntity, TransformComponent) &&
      !selectedEntities.some((entity) => hasComponent(entity, DisableTransformTagComponent))

    content = (
      <StyledNodeEditor>
        <PropertiesHeader>
          <NameInputGroupContainer>
            <NameInputGroup node={node} key={nodeEntity} />
            {!hasComponent(nodeEntity, SceneTagComponent) && (
              <>
                <VisibleInputGroup name="Dynamic Load" label={t('editor:properties.lbl-dynamicLoad')}>
                  <BooleanInput
                    value={hasComponent(nodeEntity, SceneDynamicLoadTagComponent)}
                    onChange={onChangeDynamicLoad}
                  />
                  {/** @todo add a slider for distance */}
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
          {transform && <TransformPropertyGroup node={node} />}
        </PropertiesHeader>
        {editors.map((Editor, i) => (
          <Editor key={i} multiEdit={multiEdit} node={node} />
        ))}
      </StyledNodeEditor>
    )
  }

  return <PropertiesPanelContent>{content}</PropertiesPanelContent>
}

export default PropertiesPanelContainer
