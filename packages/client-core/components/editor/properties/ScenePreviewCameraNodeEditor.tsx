import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import { Camera } from "@styled-icons/fa-solid/Camera";
import { PropertiesPanelButton } from "../inputs/Button";

/**
 * [ScenePreviewCameraNodeEditorProps declairing props for ScenePreviewCameraNodeEditor]
 * @type {Object}
 */
type ScenePreviewCameraNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [ScenePreviewCameraNodeEditor provides the editor view to customize properties]
 * @type {Class component}
 */
export default class ScenePreviewCameraNodeEditor extends Component<
  ScenePreviewCameraNodeEditorProps,
  {}
> {

  // setting iconComponent as icon name
  static iconComponent = Camera;

  // setting description for ScenePreviewCameraNode and will appear on editor view 
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
