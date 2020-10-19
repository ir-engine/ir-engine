import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Camera } from "@styled-icons/fa-solid/Camera";
import { PropertiesPanelButton } from "../inputs/Button";
type ScenePreviewCameraNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class ScenePreviewCameraNodeEditor extends Component<
  ScenePreviewCameraNodeEditorProps,
  {}
> {
  static iconComponent = Camera;
  static description =
    "The camera used to generate the thumbnail for your scene and the starting position for the preview camera in Hubs.";
  onSetFromViewport = () => {
    (this.props.node as any).setFromViewport();
  };
  render() {
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={ScenePreviewCameraNodeEditor.description} >
        <PropertiesPanelButton onClick={this.onSetFromViewport}>
          Set From Viewport
        </PropertiesPanelButton>
      </NodeEditor>
    );
  }
}
