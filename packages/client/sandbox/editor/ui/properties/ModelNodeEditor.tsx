import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import SelectInput from "../inputs/SelectInput";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import ModelInput from "../inputs/ModelInput";
import { Cube } from "@styled-icons/fa-solid/Cube";
import { GLTFInfo } from "../inputs/GLTFInfo";
type ModelNodeEditorProps = {
  editor?: object,
  node?: object,
  multiEdit?: boolean
};
export default class ModelNodeEditor extends Component<
  ModelNodeEditorProps,
  {}
> {
  onChangeSrc = (src, initialProps) => {
    this.props.editor.setPropertiesSelected({ ...initialProps, src });
  };
  onChangeAnimation = activeClipIndex => {
    this.props.editor.setPropertySelected("activeClipIndex", activeClipIndex);
  };
  onChangeCollidable = collidable => {
    this.props.editor.setPropertySelected("collidable", collidable);
  };
  onChangeWalkable = walkable => {
    this.props.editor.setPropertySelected("walkable", walkable);
  };
  onChangeCastShadow = castShadow => {
    this.props.editor.setPropertySelected("castShadow", castShadow);
  };
  onChangeReceiveShadow = receiveShadow => {
    this.props.editor.setPropertySelected("receiveShadow", receiveShadow);
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
    const node = this.props.node;
    return (
      <NodeEditor description={ModelNodeEditor.description} {...this.props}>
        <InputGroup name="Model Url">
          <ModelInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
        <InputGroup name="Loop Animation">
          <SelectInput
            disabled={this.isAnimationPropertyDisabled()}
            options={node.getClipOptions()}
            value={node.activeClipIndex}
            onChange={this.onChangeAnimation}
          />
        </InputGroup>
        <InputGroup name="Collidable">
          <BooleanInput
            value={node.collidable}
            onChange={this.onChangeCollidable}
          />
        </InputGroup>
        <InputGroup name="Walkable">
          <BooleanInput
            value={node.walkable}
            onChange={this.onChangeWalkable}
          />
        </InputGroup>
        <InputGroup name="Cast Shadow">
          <BooleanInput
            value={node.castShadow}
            onChange={this.onChangeCastShadow}
          />
        </InputGroup>
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
