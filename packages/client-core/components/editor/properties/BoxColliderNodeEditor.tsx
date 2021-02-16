import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import { HandPaper } from "@styled-icons/fa-solid/HandPaper";
type BoxColliderNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [BoxColliderNodeEditor is used to provide properties to customize box collider element]
 * @type {[component class]}
 */
export default class BoxColliderNodeEditor extends Component<
  BoxColliderNodeEditorProps,
  {}
> {
  //defining iconComponent with component name
  static iconComponent = HandPaper;

  //defining description and shows this description in NodeEditor  with title of elementt,
  // available to add in scene in assets.
  static description =
    "An invisible box that objects will bounce off of or rest on top of.\nWithout colliders, objects will fall through floors and go through walls.";
  // function to handle the changes on walkable property
  onChangeWalkable = walkable => {
    (this.props.editor as any).setPropertySelected("walkable", walkable);
  };
  //rendering view to cusomize box collider element
  render() {
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={BoxColliderNodeEditor.description}
      >
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
