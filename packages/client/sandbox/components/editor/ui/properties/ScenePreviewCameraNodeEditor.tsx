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
