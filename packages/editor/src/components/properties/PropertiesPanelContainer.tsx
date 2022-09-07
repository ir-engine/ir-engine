import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  ComponentMap,
  getAllComponents,
  hasComponent,
  setComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  PreventBakeTagComponent,
  SCENE_COMPONENT_PREVENT_BAKE
} from '@xrengine/engine/src/scene/components/PreventBakeTagComponent'
import { SceneTagComponent } from '@xrengine/engine/src/scene/components/SceneTagComponent'
import { SCENE_COMPONENT_VISIBLE, VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'

import { Close } from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'

import { executeCommandWithHistoryOnSelection } from '../../classes/History'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import EditorCommands from '../../constants/EditorCommands'
import { EntityNodeEditor } from '../../functions/PrefabEditors'
import { useEditorState } from '../../services/EditorServices'
import { useSelectionState } from '../../services/SelectionServices'
import MainMenu from '../dropDownMenu'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NameInputGroup from './NameInputGroup'
import Object3DNodeEditor from './Object3DNodeEditor'

const StyledNodeEditor = styled.div``

/**
 * PropertiesHeader used as a wrapper for NameInputGroupContainer component.
 */
const PropertiesHeader = styled.div`
  border: none !important;
  padding-bottom: 0 !important;
`

/**
 * NameInputGroupContainer used to provides styles and contains NameInputGroup and VisibleInputGroup.
 *
 *  @type {Styled Component}
 */
const NameInputGroupContainer = styled.div``
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
const PropertiesPanelContent = styled.div`
  overflow-y: auto;
  height: 100%;
`

/**
 * NoNodeSelectedMessage used to show the message when no selected no is there.
 *
 * @type {Styled component}
 */
const NoNodeSelectedMessage = styled.div`
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
  const editorState = useEditorState()
  const selectedEntities = selectionState.selectedEntities.value
  const { t } = useTranslation()

  const [isMenuOpen, setMenuOpen] = useState(false)

  // access state to detect the change
  selectionState.objectChangeCounter.value

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
  const world = Engine.instance.currentWorld
  const lockedNode = editorState.lockPropertiesPanel.value
  const multiEdit = selectedEntities.length > 1
  const nodeEntity = lockedNode
    ? world.entityTree.uuidNodeMap.get(lockedNode)!.entity
    : selectedEntities[selectedEntities.length - 1]
  const isObject3D = typeof nodeEntity === 'string'
  const node = isObject3D
    ? world.scene.getObjectByProperty('uuid', nodeEntity)
    : world.entityTree.entityNodeMap.get(nodeEntity)

  if (!nodeEntity || !node) {
    content = <NoNodeSelectedMessage>{t('editor:properties.noNodeSelected')}</NoNodeSelectedMessage>
  } else if (isObject3D) {
    content = (
      <StyledNodeEditor>
        <Object3DNodeEditor multiEdit={multiEdit} node={node as EntityTreeNode} />
      </StyledNodeEditor>
    )
  } else {
    const components = getAllComponents(nodeEntity).filter((c) => EntityNodeEditor.has(c))
    // todo - still WIP
    // const registeredComponents = Array.from(Engine.instance.currentWorld.sceneComponentRegistry)

    content = (
      <StyledNodeEditor>
        <PropertiesHeader>
          <NameInputGroupContainer>
            <NameInputGroup node={node as EntityTreeNode} key={nodeEntity} />
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
        </PropertiesHeader>
        {/** @todo this is the add component menu - still a work in progress */}
        {/* <div style={{ pointerEvents: 'auto' }}>
          <MainMenu
            icon={isMenuOpen ? Close : AddIcon}
            isMenuOpen={isMenuOpen}
            setMenuOpen={setMenuOpen}
            commands={Array.from(EntityNodeEditor).map(([component, editor]) => ({
              name: component._name,
              action: () => {
                const [sceneComponentID] = registeredComponents.find(([_, prefab]) => prefab === component._name)!
                const sceneComponent = Engine.instance.currentWorld.sceneLoadingRegistry.get(sceneComponentID)!
                if (!sceneComponentID)
                  return console.warn('[ SceneLoading] could not find component name', sceneComponentID)
                if (!ComponentMap.get(sceneComponentID))
                  return console.warn('[ SceneLoading] could not find component', sceneComponentID)
                const isTagComponent = !sceneComponent.defaultData
                setComponent(
                  nodeEntity,
                  ComponentMap.get(sceneComponentID),
                  isTagComponent ? true : { ...sceneComponent.defaultData, ...component.props }
                )
              }
            }))}
          />
        </div> */}
        {components.map((c, i) => {
          const Editor = EntityNodeEditor.get(c)!
          return <Editor key={i} multiEdit={multiEdit} node={node as EntityTreeNode} component={c} />
        })}
      </StyledNodeEditor>
    )
  }

  return <PropertiesPanelContent>{content}</PropertiesPanelContent>
}

export default PropertiesPanelContainer
