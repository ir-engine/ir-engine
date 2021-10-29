import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import TransformPropertyGroup from './TransformPropertyGroup'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { NodeManager } from '../../managers/NodeManager'
import EntityMetadataEditor from './EntityMetadataEditor'
import { addComponent, getAllComponents, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import EditorEvents from '../../constants/EditorEvents'
import { ComponentNames } from '@xrengine/engine/src/common/constants/ComponentNames'
import { ComponentMeta } from '@xrengine/engine/src/common/constants/Object3DClassMap'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

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
  background-color: ${(props) => theme.panel2};
  border: none !important;
  padding-bottom: 0 !important;
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
const PropertiesPanelContainer = (t: Function) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  const onSelectionChanged = () => {
    forceUpdate()
  }

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
  }, [])

  useEffect(() => {
    CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), onSelectionChanged)
  }, null)

  const onSelectComponent = (value) => {
    const componentMeta = ComponentMeta[value]

    if (!componentMeta || !componentMeta.component) return

    const selected = CommandManager.instance.selected
    const activeNode = selected[selected.length - 1]

    if (componentMeta.object3d) {
      const object3dComponent = getComponent(activeNode.eid, Object3DComponent)
      addComponent(activeNode.eid, componentMeta.component, new componentMeta.componentData(object3dComponent, {}))
    } else {
      addComponent(activeNode.eid, componentMeta.component, new componentMeta.componentData({}))
    }

    forceUpdate()
  }

  const renderAddComponent = (activeNode, components) => {
    const componentNames = Array.isArray(components) ? components.map((c) => c._name) : []

    const systemComponents = []
    const keys = Object.keys(ComponentMeta)
    for (let i = 0; i < keys.length; i++) {
      if (ComponentMeta[keys[i]].order < 0 && !componentNames.includes(keys[i])) {
        systemComponents.push({
          label: keys[i],
          value: keys[i]
        })
      }
    }

    return (
      <InputGroup name="Add Component">
        <SelectInput
          options={systemComponents}
          onChange={onSelectComponent}
          placeholder={t('editor:properties.addComponent')}
        />
      </InputGroup>
    )
  }

  const selected = CommandManager.instance.selected

  let content

  if (selected.length === 0) {
    content = <NoNodeSelectedMessage>{t('editor:properties.noNodeSelected')}</NoNodeSelectedMessage>
  } else {
    const activeNode = selected[selected.length - 1]
    const components = getAllComponents(activeNode.eid)

    let NodeEditors = []
    for (let i = 0; i < components.length; i++) {
      if (components[i]._name === ComponentNames.NAME) continue
      if (components[i]._name === ComponentNames.VISIBILE) continue
      if (components[i]._name === ComponentNames.TRANSFORM) continue

      const editor = NodeManager.instance.getEditorFromClass(components[i]._name)
      if (editor) NodeEditors.push(editor)
    }

    let showNodeEditor = true
    for (let i = 0; i < selected.length - 1; i++) {
      if (NodeEditors.includes(NodeManager.instance.getEditorFromClass(selected[i]))) {
        showNodeEditor = false
        break
      }
    }

    let nodeEditor
    if (showNodeEditor) {
      nodeEditor = NodeEditors.map((Editor, i) => <Editor multiEdit={selected.length > 1} node={activeNode} key={i} />)
    } else {
      nodeEditor = <NoNodeSelectedMessage>{t('editor:properties.multipleNodeSelected')}</NoNodeSelectedMessage>
    }

    const disableTransform = selected.some((node) => !node.parentNode)
    // const haveStaticTags = selected.some((node) => node.haveStaticTags)

    content = (
      <StyledNodeEditor>
        <PropertiesHeader>
          {/* <NameInputGroupContainer>
              <NameInputGroup node={activeNode} />
              {activeNode.nodeName !== 'Scene' && (
                <>
                  <VisibleInputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
                    <BooleanInput value={activeNode.visible} onChange={onChangeVisible} />
                  </VisibleInputGroup>
                  {haveStaticTags && (
                    <VisibleInputGroup name="Bake Static" label="Bake Static">
                      <BooleanInput value={activeNode.includeInCubemapBake} onChange={onChangeBakeStatic} />
                    </VisibleInputGroup>
                  )}
                </>
              )}
            </NameInputGroupContainer>
            <PersistInputGroup name="Persist" label={t('editor:properties.lbl-persist')}>
              <BooleanInput value={activeNode.persist} onChange={onChangePersist} />
            </PersistInputGroup> */}
          <EntityMetadataEditor node={activeNode} />
          {!disableTransform && <TransformPropertyGroup node={activeNode} />}
        </PropertiesHeader>
        {nodeEditor}
        {!activeNode.parentNode && // Currently it is available for Scene node only
          renderAddComponent(activeNode, components)}
      </StyledNodeEditor>
    )
  }

  return <PropertiesPanelContent>{content}</PropertiesPanelContent>
}

export default withTranslation()(PropertiesPanelContainer)
