import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { PreventBakeTagComponent } from '@xrengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
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

/**
 * StyledNodeEditor used as wrapper container element properties container.
 *
 * @author Robert Long
 * @type {styled component}
 */
const StyledNodeEditor = (styled as any).div`
`

/**
 * PropertiesHeader used as a wrapper for NameInputGroupContainer component.
 *
 * @author Robert Long
 */
const PropertiesHeader = (styled as any).div`
  border: none !important;
  padding-bottom: 0 !important;
`

/**
 * NameInputGroupContainer used to provides styles and contains NameInputGroup and VisibleInputGroup.
 *
 *  @author Robert Long
 *  @type {Styled Component}
 */
const NameInputGroupContainer = (styled as any).div`
`
/**
 * Styled component used to provide styles for visiblity checkbox.
 *
 * @author Robert Long
 */
const VisibleInputGroup = (styled as any)(InputGroup)`
  & > label {
    width: auto !important;
  }
`

/**
 * Styled component used to provide styles for visiblity checkbox.
 *
 * @author Robert Long
 */
const PersistInputGroup = (styled as any)(InputGroup)`
 & > label {
   width: auto !important;
 }
`

/**
 * PropertiesPanelContent used as container element contains content of editor view.
 *
 * @author Robert Long
 * @type {Styled Component}
 */
const PropertiesPanelContent = (styled as any).div`
  overflow-y: auto;
  height: 100%;
`

/**
 * NoNodeSelectedMessage used to show the message when no selected no is there.
 *
 * @author Robert Long
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
 * @author Robert Long
 * @extends Component
 */
export const PropertiesPanelContainer = () => {
  const selectionState = useSelectionState()
  const selectedEntities = selectionState.selectedEntities.value
  const { t } = useTranslation()

  // access state to detect the change
  selectionState.objectChangeCounter.value

  const onChangeVisible = (value) => {
    executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: VisibleComponent,
        sceneComponentName: SCENE_COMPONENT_VISIBLE,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }

  const onChangeBakeStatic = (value) => {
    executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: PreventBakeTagComponent,
        sceneComponentName: SCENE_COMPONENT_PREVENT_BAKE,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }

  const onChangePersist = (value) => {
    executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: PersistTagComponent,
        sceneComponentName: SCENE_COMPONENT_PERSIST,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }

  //rendering editor views for customization of element properties
  let content
  const multiEdit = selectedEntities.length > 1
  const nodeEntity = selectedEntities[selectedEntities.length - 1]
  const node = useWorld().entityTree.entityNodeMap.get(nodeEntity)

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
          <PersistInputGroup name="Persist" label={t('editor:properties.lbl-persist')}>
            <BooleanInput value={hasComponent(nodeEntity, PersistTagComponent)} onChange={onChangePersist} />
          </PersistInputGroup>
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
