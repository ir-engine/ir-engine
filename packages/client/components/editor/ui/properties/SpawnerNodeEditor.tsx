import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ModelInput from "../inputs/ModelInput";
import { Magic } from "@styled-icons/fa-solid/Magic";
import { GLTFInfo } from "../inputs/GLTFInfo";
type SpawnerNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class SpawnerNodeEditor extends Component<
  SpawnerNodeEditorProps,
  {}
> {
  static iconComponent = Magic;
  static description = "Spawns a model as an interactable object.";
  onChangeSrc = (src, initialProps) => {
    (this.props.editor as any).setPropertiesSelected({ ...initialProps, src });
  };
  render() {
    const node = this.props.node as any;
    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={SpawnerNodeEditor.description}>
        { /* @ts-ignore */ }
        <InputGroup name="Model Url">
          <ModelInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
        {node.model && <GLTFInfo node={node} />}
      </NodeEditor>
    );
  }
}
