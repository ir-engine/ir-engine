import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import BooleanInput from "../inputs/BooleanInput";
import { SquareFull } from "@styled-icons/fa-solid/SquareFull";
type GroundPlaneNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class GroundPlaneNodeEditor extends Component<
  GroundPlaneNodeEditorProps,
  {}
> {
  static iconComponent = SquareFull;
  static description = "A flat ground plane that extends into the distance.";
  onChangeColor = color => {
    (this.props.editor as any).setPropertySelected("color", color);
  };
  onChangeReceiveShadow = receiveShadow => {
    (this.props.editor as any).setPropertySelected("receiveShadow", receiveShadow);
  };
  onChangeWalkable = walkable => {
    (this.props.editor as any).setPropertySelected("walkable", walkable);
  };
  render() {
    const node = this.props.node;
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={GroundPlaneNodeEditor.description}
      >
        { /* @ts-ignore */ }
        <InputGroup name="Color">
        { /* @ts-ignore */ }
          <ColorInput value={node.color} onChange={this.onChangeColor} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Receive Shadow">
          <BooleanInput
          /* @ts-ignore */
            value={node.receiveShadow}
            onChange={this.onChangeReceiveShadow}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Walkable">
          <BooleanInput
            value={(this.props.node as any).walkable}
            onChange={this.onChangeWalkable}
          />
        </InputGroup>
      </NodeEditor>
    );
  }
}
