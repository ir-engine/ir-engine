import React, { Component } from "react";
import PropTypes from "prop-types";
import { withEditor } from "../contexts/EditorContext";
import DefaultNodeEditor from "./DefaultNodeEditor";
import Panel from "../layout/Panel";
import styled from "styled-components";
import { SlidersH } from "@styled-icons/fa-solid/SlidersH";
import TransformPropertyGroup from "./TransformPropertyGroup";
import NameInputGroup from "./NameInputGroup";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";

/**
 * [StyledNodeEditor used as wrapper container element properties container]
 * @type {styled component}
 */
const StyledNodeEditor = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

/**
 * [PropertiesHeader used as a wrapper for NameInputGroupContainer component
 */
const PropertiesHeader = (styled as any).div`
  background-color: ${props => props.theme.panel2};
  border: none !important;
  padding-bottom: 0 !important;
`;


/**
 * [NameInputGroupContainer used to provides styles and contains NameInputGroup and VisibleInputGroup]
 * @type {Styled Component}
 */
const NameInputGroupContainer = (styled as any).div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  padding: 8px 0;
`;
/**
 * [Styled component used to provide styles for visiblity checkbox ]
 */
const VisibleInputGroup = (styled as any)(InputGroup)`
  display: flex;
  flex: 0;

  & > label {
    width: auto !important;
    padding-right: 8px;
  }
`;

/**
 * [PropertiesPanelContent used as container element contains content of editor view]
 * @type {Styled Component}
 */
const PropertiesPanelContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

/**
 * [NoNodeSelectedMessage used to show the message when no selected no is there]
 * @type {Styled component}
 */
const NoNodeSelectedMessage = (styled as any).div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

/**
 * [PropertiesPanelContainer used to render editor view to customize property of selected element]
 * @extends Component
 */
class PropertiesPanelContainer extends Component {
  static propTypes = {
    editor: PropTypes.object
  };

  //setting the props and state
  constructor(props) {
    super(props);

    this.state = {
      selected: props.editor.selected
    };
  }

  // adding listeners when component get mounted
  componentDidMount() {
    const editor = (this.props as any).editor;
    editor.addListener("selectionChanged", this.onSelectionChanged);
    editor.addListener("objectsChanged", this.onObjectsChanged);
  }

  // removing listeners when components get unmounted
  componentWillUnmount() {
    const editor = (this.props as any).editor;
    editor.removeListener("selectionChanged", this.onSelectionChanged);
    editor.removeListener("objectsChanged", this.onObjectsChanged);
  }

  // updating state when selection of element get changed
  onSelectionChanged = () => {
    this.setState({ selected: (this.props as any).editor.selected });
  };

   //function to handle the changes object properties
  onObjectsChanged = (objects, property) => {
    const selected = (this.props as any).editor.selected;

    if (property === "position" || property === "rotation" || property === "scale" || property === "matrix") {
      return;
    }

    for (let i = 0; i < objects.length; i++) {
      if (selected.indexOf(objects[i]) !== -1) {
        this.setState({ selected: (this.props as any).editor.selected });
        return;
      }
    }
  };

   // function to handle the changes property visible
  onChangeVisible = value => {
    ((this.props as any).editor as any).setPropertySelected("visible", value);
  };

  //rendering editor views for customization of element properties
  render() {
    const editor = (this.props as any).editor;
    const selected = (this.state as any).selected;

    let content;

    if (selected.length === 0) {
      content = <NoNodeSelectedMessage>No node selected</NoNodeSelectedMessage>;
    } else {
      const activeNode = selected[selected.length - 1];
      const NodeEditor = editor.getNodeEditor(activeNode) || DefaultNodeEditor;

      const multiEdit = selected.length > 1;

      let showNodeEditor = true;

      for (let i = 0; i < selected.length - 1; i++) {
        if (editor.getNodeEditor(selected[i]) !== NodeEditor) {
          showNodeEditor = false;
          break;
        }
      }

      let nodeEditor;

      if (showNodeEditor) {
        nodeEditor = <NodeEditor multiEdit={multiEdit} node={activeNode} editor={editor} />;
      } else {
        nodeEditor = <NoNodeSelectedMessage>Multiple Nodes of different types selected</NoNodeSelectedMessage>;
      }

      const disableTransform = selected.some(node => node.disableTransform);

      content = (
        <StyledNodeEditor>
          <PropertiesHeader>
            <NameInputGroupContainer>
              <NameInputGroup node={activeNode} editor={editor} />
              {activeNode.nodeName !== "Scene" && (
                <VisibleInputGroup name="Visible">
                  <BooleanInput value={activeNode.visible} onChange={this.onChangeVisible} />
                </VisibleInputGroup>
              )}
            </NameInputGroupContainer>
            {!disableTransform && <TransformPropertyGroup node={activeNode} editor={editor} />}
          </PropertiesHeader>
          {nodeEditor}
        </StyledNodeEditor>
      );
    }

    return (
      /* @ts-ignore */
      <Panel id="properties-panel" title="Properties" icon={SlidersH}>
        <PropertiesPanelContent>{content}</PropertiesPanelContent>
      </Panel>
    );
  }
}

export default withEditor(PropertiesPanelContainer);
