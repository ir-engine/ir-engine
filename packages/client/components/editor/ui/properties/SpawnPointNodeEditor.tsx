import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { StreetView } from "@styled-icons/fa-solid/StreetView";
type SpawnPointNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class SpawnPointNodeEditor extends Component<
  SpawnPointNodeEditorProps,
  {}
> {
  static iconComponent = StreetView;
  static description = "A point where people will appear when they enter your scene.\nThe icon in the Viewport represents the actual size of an avatar.";
  render() {
    return (
      <NodeEditor
      /* @ts-ignore */
        description={SpawnPointNodeEditor.description}
        {...this.props}
      />
    );
  }
}
