import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import SelectInput from "../inputs/SelectInput";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import ModelInput from "../inputs/ModelInput";
import { Cube } from "@styled-icons/fa-solid/Cube";
import { GLTFInfo } from "../inputs/GLTFInfo";
type ModelNodeEditorProps = {
  editor?: object;
  node?: object;
  multiEdit?: boolean;
};
export default class ModelNodeEditor extends Component<
  ModelNodeEditorProps,
  {}
> {
  static iconComponent = Cube;
  static description = "A 3D model in your scene, loaded from a GLTF URL or file.";
  onChangeSrc = (src, initialProps) => {
    (this.props.editor as any).setPropertiesSelected({ ...initialProps, src });
  };
  onChangeAnimation = activeClipIndex => {
    (this.props.editor as any).setPropertySelected("activeClipIndex", activeClipIndex);
  };
  onChangeCollidable = collidable => {
    (this.props.editor as any).setPropertySelected("collidable", collidable);
  };
  onChangeWalkable = walkable => {
    (this.props.editor as any).setPropertySelected("walkable", walkable);
  };
  onChangeCastShadow = castShadow => {
    (this.props.editor as any).setPropertySelected("castShadow", castShadow);
  };
  onChangeReceiveShadow = receiveShadow => {
    (this.props.editor as any).setPropertySelected("receiveShadow", receiveShadow);
  };
  isAnimationPropertyDisabled() {
    const { multiEdit, editor, node } = this.props as any;
    if (multiEdit) {
      return editor.selected.some(
        selectedNode => selectedNode.src !== node.src
      );
    }
    return false;
  }
  render() {
    const node = this.props.node as any;
    return (
      /* @ts-ignore */
      <NodeEditor description={ModelNodeEditor.description} {...this.props}>
        { /* @ts-ignore */ }
        <InputGroup name="Model Url">
          <ModelInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Loop Animation">
          { /* @ts-ignore */}
          <SelectInput
            disabled={this.isAnimationPropertyDisabled()}
            options={node.getClipOptions()}
            value={node.activeClipIndex}
            onChange={this.onChangeAnimation}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Collidable">
          <BooleanInput
            value={node.collidable}
            onChange={this.onChangeCollidable}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Walkable">
          <BooleanInput
            value={node.walkable}
            onChange={this.onChangeWalkable}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Cast Shadow">
          <BooleanInput
            value={node.castShadow}
            onChange={this.onChangeCastShadow}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Receive Shadow">
          <BooleanInput
            value={node.receiveShadow}
            onChange={this.onChangeReceiveShadow}
          />
        </InputGroup>
        {node.model && <GLTFInfo node={node} />}
      </NodeEditor>
    );
  }
}
