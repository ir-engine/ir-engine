import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { StreetView } from "@styled-icons/fa-solid/StreetView";

/**
 * [SpawnPointNodeEditorProps declairing properties for SpawnPointNodeEditor ]
 * @type {Object}
 */
type SpawnPointNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [SpawnPointNodeEditor component used to provide the editor view to customize SpawnPointNode properties]
 * @type {Class component}
 */
export default class SpawnPointNodeEditor extends Component<
  SpawnPointNodeEditorProps,
  {}
> {

  // initializing iconComponent icon name
  static iconComponent = StreetView;

  // initializing description and will appear on the editor view
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
