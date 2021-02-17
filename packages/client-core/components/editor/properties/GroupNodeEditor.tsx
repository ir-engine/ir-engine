import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Cubes } from "@styled-icons/fa-solid/Cubes";
type GroupNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [GroupNodeEditor used to render group of multiple objects]
 * @type {class component}
 */
export default class GroupNodeEditor extends Component<
  GroupNodeEditorProps,
  {}
> {

  //setting icon for GroupNod
  static iconComponent = Cubes;

  //description for groupNode and will appears on properties container
  static description =
    "A group of multiple objects that can be moved or duplicated together.\nDrag and drop objects into the Group in the Hierarchy.";
  render() {
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={GroupNodeEditor.description} />
    );
  }
}
