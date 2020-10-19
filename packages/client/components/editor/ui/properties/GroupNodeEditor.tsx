import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Cubes } from "@styled-icons/fa-solid/Cubes";
type GroupNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class GroupNodeEditor extends Component<
  GroupNodeEditorProps,
  {}
> {
  static iconComponent = Cubes;
  static description =
    "A group of multiple objects that can be moved or duplicated together.\nDrag and drop objects into the Group in the Hierarchy.";
  render() {
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={GroupNodeEditor.description} />
    );
  }
}
