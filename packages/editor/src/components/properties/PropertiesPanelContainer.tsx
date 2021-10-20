import React, { Component } from 'react'
import DefaultNodeEditor from './DefaultNodeEditor'
import styled from 'styled-components'
import TransformPropertyGroup from './TransformPropertyGroup'
import NameInputGroup from './NameInputGroup'
import InputGroup from '../inputs/InputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { withTranslation } from 'react-i18next'
import EditorEvents from '../../constants/EditorEvents'
import { CommandManager } from '../../managers/CommandManager'
import { NodeManager } from '../../managers/NodeManager'

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
class PropertiesPanelContainer extends Component<{ t: Function }> {
  //setting the props and state
  constructor(props) {
    super(props)

    this.state = {
      selected: CommandManager.instance.selected
    }
  }

  // adding listeners when component get mounted
  componentDidMount() {
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), this.onSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }

  // removing listeners when components get unmounted
  componentWillUnmount() {
    CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), this.onSelectionChanged)
    CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }

  // updating state when selection of element get changed
  onSelectionChanged = () => {
    this.setState({ selected: CommandManager.instance.selected })
  }

  //function to handle the changes object properties
  onObjectsChanged = (objects, property) => {
    const selected = CommandManager.instance.selected

    if (property === 'position' || property === 'rotation' || property === 'scale' || property === 'matrix') {
      return
    }

    for (let i = 0; i < objects.length; i++) {
      if (selected.indexOf(objects[i]) !== -1) {
        this.setState({ selected: CommandManager.instance.selected })
        return
      }
    }
  }

  // function to handle the changes property visible
  onChangeVisible = (value) => {
    CommandManager.instance.setPropertyOnSelection('visible', value)
  }

  onChangeBakeStatic = (value) => {
    CommandManager.instance.setPropertyOnSelection('includeInCubemapBake', value)
  }

  onChangePersist = (value) => {
    CommandManager.instance.setPropertyOnSelection('persist', value)
  }

  //rendering editor views for customization of element properties
  render() {
    const selected = CommandManager.instance.selected

    let content

    if (selected.length === 0) {
      content = <NoNodeSelectedMessage>{this.props.t('editor:properties.noNodeSelected')}</NoNodeSelectedMessage>
    } else {
      const activeNode = selected[selected.length - 1]
      const NodeEditor = NodeManager.instance.getEditorFromNode(activeNode) || DefaultNodeEditor

      const multiEdit = selected.length > 1

      let showNodeEditor = true

      for (let i = 0; i < selected.length - 1; i++) {
        if (NodeManager.instance.getEditorFromNode(selected[i]) !== NodeEditor) {
          showNodeEditor = false
          break
        }
      }

      let nodeEditor

      if (showNodeEditor) {
        nodeEditor = <NodeEditor multiEdit={multiEdit} node={activeNode} />
      } else {
        nodeEditor = (
          <NoNodeSelectedMessage>{this.props.t('editor:properties.multipleNodeSelected')}</NoNodeSelectedMessage>
        )
      }

      const disableTransform = selected.some((node) => node.disableTransform)
      const haveStaticTags = selected.some((node) => node.haveStaticTags)

      content = (
        <StyledNodeEditor>
          <PropertiesHeader>
            <NameInputGroupContainer>
              <NameInputGroup node={activeNode} />
              {activeNode.nodeName !== 'Scene' && (
                <>
                  <VisibleInputGroup name="Visible" label={this.props.t('editor:properties.lbl-visible')}>
                    <BooleanInput value={activeNode.visible} onChange={this.onChangeVisible} />
                  </VisibleInputGroup>
                  {haveStaticTags && (
                    <VisibleInputGroup name="Bake Static" label="Bake Static">
                      <BooleanInput value={activeNode.includeInCubemapBake} onChange={this.onChangeBakeStatic} />
                    </VisibleInputGroup>
                  )}
                </>
              )}
            </NameInputGroupContainer>
            <PersistInputGroup name="Persist" label={this.props.t('editor:properties.lbl-persist')}>
              <BooleanInput value={activeNode.persist} onChange={this.onChangePersist} />
            </PersistInputGroup>
            {!disableTransform && <TransformPropertyGroup node={activeNode} />}
          </PropertiesHeader>
          {nodeEditor}
        </StyledNodeEditor>
      )
    }

    return <PropertiesPanelContent>{content}</PropertiesPanelContent>
  }
}

export default withTranslation()(PropertiesPanelContainer)
