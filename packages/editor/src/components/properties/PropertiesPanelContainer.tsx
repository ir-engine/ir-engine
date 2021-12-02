import React, { useEffect, useState } from 'react'
import DefaultNodeEditor from './DefaultNodeEditor'
import styled from 'styled-components'
import TransformPropertyGroup from './TransformPropertyGroup'
import NameInputGroup from './NameInputGroup'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { useTranslation } from 'react-i18next'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import { EntityNodeEditor, NodeManager } from '../../managers/NodeManager'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { IncludeInCubemapBakeComponent } from '@xrengine/engine/src/scene/components/IncludeInCubemapBakeComponent'
import EditorCommands from '../../constants/EditorCommands'
import { TagComponentOperation } from '../../commands/TagComponentCommand'
import { EntityNodeType } from '@xrengine/engine/src/scene/constants/EntityNodeType'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'

/**
 * StyledNodeEditor used as wrapper container element properties container.
 *
 * @author Robert Long
 * @type {styled component}
 */
const StyledNodeEditor = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

/**
 * PropertiesHeader used as a wrapper for NameInputGroupContainer component.
 *
 * @author Robert Long
 */
const PropertiesHeader = (styled as any).div`
  background-color: ${(props) => props.theme.panel2};
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
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  padding: 8px 0;
`
/**
 * Styled component used to provide styles for visiblity checkbox.
 *
 * @author Robert Long
 */
const VisibleInputGroup = (styled as any)(InputGroup)`
  display: flex;
  flex: 0;

  & > label {
    width: auto !important;
    padding-right: 8px;
  }
`

/**
 * Styled component used to provide styles for visiblity checkbox.
 *
 * @author Robert Long
 */
const PersistInputGroup = (styled as any)(InputGroup)`
 display: flex;
 flex: 0;

 & > label {
   width: auto !important;
   padding-right: 8px;
 }
`

/**
 * PropertiesPanelContent used as container element contains content of editor view.
 *
 * @author Robert Long
 * @type {Styled Component}
 */
const PropertiesPanelContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`

/**
 * PropertiesPanelContainer used to render editor view to customize property of selected element.
 *
 * @author Robert Long
 * @extends Component
 */
export const PropertiesPanelContainer = () => {
  //setting the props and state
  const [selected, setSelected] = useState(CommandManager.instance.selected)
  const [{ node }, setActiveNode] = useState<{ node: EntityTreeNode }>({ node: null! })
  const { t } = useTranslation()

  const onSelectionChanged = () => {
    setSelected(CommandManager.instance.selected)
  }

  useEffect(() => {
    setActiveNode({ node: selected[selected.length - 1] })
  }, [selected])

  const onObjectsChanged = (objects, property) => {
    const selected = CommandManager.instance.selected

    setActiveNode({ node: selected[selected.length - 1] })

    if (property === 'position' || property === 'rotation' || property === 'scale' || property === 'matrix') {
      return
    }

    for (let i = 0; i < objects.length; i++) {
      if (selected.indexOf(objects[i]) !== -1) {
        setSelected(CommandManager.instance.selected)
        return
      }
    }
  }

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectsChanged)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
      CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectsChanged)
    }
  }, [])

  const onChangeVisible = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: VisibleComponent,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }

  const onChangeBakeStatic = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: IncludeInCubemapBakeComponent,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }

  const onChangePersist = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.TAG_COMPONENT, {
      operation: {
        component: PersistTagComponent,
        type: value ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
      }
    })
  }

  //rendering editor views for customization of element properties
  let content
  let showNodeEditor = true
  let isScene = false
  const multiEdit = selected.length > 1

  if (!node) {
    content = <NoNodeSelectedMessage>{t('editor:properties.noNodeSelected')}</NoNodeSelectedMessage>
  } else {
    const entityNodeComponent = getComponent(node.entity, EntityNodeComponent)
    isScene = entityNodeComponent.type === EntityNodeType.SCENE
    const NodeEditor = EntityNodeEditor[entityNodeComponent.type] || DefaultNodeEditor

    for (let i = 0; i < selected.length - 1; i++) {
      if (NodeManager.instance.getEditorFromNode(selected[i]) !== NodeEditor) {
        showNodeEditor = false
        break
      }
    }

    let nodeEditor

    if (showNodeEditor) {
      nodeEditor = <NodeEditor multiEdit={multiEdit} node={node} />
    } else {
      nodeEditor = <NoNodeSelectedMessage>{t('editor:properties.multipleNodeSelected')}</NoNodeSelectedMessage>
    }

    const disableTransform = selected.some((node) => hasComponent(node.entity, DisableTransformTagComponent))
    const haveStaticTags = selected.some((node) => node.haveStaticTags)

    const visibleComponent = getComponent(node.entity, VisibleComponent)
    const persistComponent = getComponent(node.entity, PersistTagComponent)
    const includeInCubemapBakeComponent = getComponent(node.entity, IncludeInCubemapBakeComponent)

    content = (
      <StyledNodeEditor>
        <PropertiesHeader>
          <NameInputGroupContainer>
            <NameInputGroup node={node} key={node.entity} />
            {!isScene && (
              <>
                <VisibleInputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
                  <BooleanInput value={!!visibleComponent} onChange={onChangeVisible} />
                </VisibleInputGroup>
                {haveStaticTags && (
                  <VisibleInputGroup name="Bake Static" label="Bake Static">
                    <BooleanInput value={!!includeInCubemapBakeComponent} onChange={onChangeBakeStatic} />
                  </VisibleInputGroup>
                )}
              </>
            )}
          </NameInputGroupContainer>
          <PersistInputGroup name="Persist" label={t('editor:properties.lbl-persist')}>
            <BooleanInput value={!!persistComponent} onChange={onChangePersist} />
          </PersistInputGroup>
          {!isScene && !disableTransform && <TransformPropertyGroup node={node} />}
        </PropertiesHeader>
        {nodeEditor}
      </StyledNodeEditor>
    )
  }

  return <PropertiesPanelContent>{content}</PropertiesPanelContent>
}

export default PropertiesPanelContainer
