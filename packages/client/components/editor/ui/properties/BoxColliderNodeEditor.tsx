import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import { HandPaper } from "@styled-icons/fa-solid/HandPaper";
type BoxColliderNodeEditorProps = {
  editor?: object,
  node?: object
};
export default class BoxColliderNodeEditor extends Component<
  BoxColliderNodeEditorProps,
  {}
> {
  onChangeWalkable = walkable => {
    this.props.editor.setPropertySelected("walkable", walkable);
  };
  render() {
    return (
      <NodeEditor
        {...this.props}
        description={BoxColliderNodeEditor.description}
      >
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
