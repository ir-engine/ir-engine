import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import BooleanInput from "../inputs/BooleanInput";
import { SquareFull } from "@styled-icons/fa-solid/SquareFull";
type GroundPlaneNodeEditorProps = {
  editor?: object,
  node?: object
};
export default class GroundPlaneNodeEditor extends Component<
  GroundPlaneNodeEditorProps,
  {}
> {
  onChangeColor = color => {
    this.props.editor.setPropertySelected("color", color);
  };
  onChangeReceiveShadow = receiveShadow => {
    this.props.editor.setPropertySelected("receiveShadow", receiveShadow);
  };
  onChangeWalkable = walkable => {
    this.props.editor.setPropertySelected("walkable", walkable);
  };
  render() {
    const node = this.props.node;
    return (
      <NodeEditor
        {...this.props}
        description={GroundPlaneNodeEditor.description}
      >
        <InputGroup name="Color">
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        <InputGroup name="Receive Shadow">
          <BooleanInput
            value={node.receiveShadow}
            onChange={this.onChangeReceiveShadow}
          />
        </InputGroup>
        <InputGroup name="Walkable">
          <BooleanInput
            value={this.props.node.walkable}
            onChange={this.onChangeWalkable}
          />
        </InputGroup>
      </NodeEditor>
    );
  }
}
