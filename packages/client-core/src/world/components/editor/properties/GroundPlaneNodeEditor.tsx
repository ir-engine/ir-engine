import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import BooleanInput from "../inputs/BooleanInput";
import { SquareFull } from "@styled-icons/fa-solid/SquareFull";

/**
 * [Declairing GroundPlaneNodeEditor properties]
 * @type {Object}
 */

type GroundPlaneNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [iconComponent is used to render GroundPlaneNode and provide inputs to customize floorPlanNode]
 * @type {class component}
 */
export default class GroundPlaneNodeEditor extends Component<
  GroundPlaneNodeEditorProps,
  {}
> {
  // setting icon component name
  static iconComponent = SquareFull;

  // setting description will show on properties container
  static description = "A flat ground plane that extends into the distance.";

  //function handles the changes in color property
  onChangeColor = color => {
    (this.props.editor as any).setPropertySelected("color", color);
  };

  //function handles the changes for receiveShadow property
  onChangeReceiveShadow = receiveShadow => {
    (this.props.editor as any).setPropertySelected("receiveShadow", receiveShadow);
  };

  // function handles the changes in walkable property
  onChangeWalkable = walkable => {
    (this.props.editor as any).setPropertySelected("walkable", walkable);
  };

  //rendering GroundPlaneNode node customization view
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
