import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import SelectInput from "../inputs/SelectInput";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import ModelInput from "../inputs/ModelInput";
import { Cube } from "@styled-icons/fa-solid/Cube";
import StringInput from "../inputs/StringInput";

const InteractableOption = [
  {
    label: "InfoBox",
    value: "infoBox"
  },
  {
    label: "Open link",
    value: "link"
  },
];

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
  onChangeInteractable = interactable => {
    (this.props.editor as any).setPropertySelected("interactable", interactable);
  };
  onChangeInteractionType = interactionType => {
    (this.props.editor as any).setPropertySelected("interactionType", interactionType);
  };
  onChangeInteractionText = interactionText => {
    (this.props.editor as any).setPropertySelected("interactionText", interactionText);
  };
  onChangePayloadName = payloadName => {
    (this.props.editor as any).setPropertySelected("payloadName", payloadName);
  };
  onChangePayloadUrl = payloadUrl => {
    (this.props.editor as any).setPropertySelected("payloadUrl", payloadUrl);
  };
  onChangePayloadBuyUrl = payloadBuyUrl => {
    (this.props.editor as any).setPropertySelected("payloadBuyUrl", payloadBuyUrl);
  };
  onChangePayloadLearnMoreUrl = payloadLearnMoreUrl => {
    (this.props.editor as any).setPropertySelected("payloadLearnMoreUrl", payloadLearnMoreUrl);
  };
  onChangePayloadHtmlContent = payloadHtmlContent => {
    (this.props.editor as any).setPropertySelected("payloadHtmlContent", payloadHtmlContent);
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

  renderInteractableTypeOptions = (node) =>{
    switch (node.interactionType){
      case 'infoBox': return <>
        { /* @ts-ignore */ }
        <InputGroup name="Name">
          <StringInput
            /* @ts-ignore */
            value={node.payloadName}
            onChange={this.onChangePayloadName}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Url">
          <StringInput
            /* @ts-ignore */
            value={node.payloadUrl}
            onChange={this.onChangePayloadUrl}
          />
        </InputGroup>
         { /* @ts-ignore */ }
        <InputGroup name="BuyUrl">
          <StringInput
            /* @ts-ignore */
            value={node.payloadBuyUrl}
            onChange={this.onChangePayloadBuyUrl}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="LearnMoreUrl">
          <StringInput
            /* @ts-ignore */
            value={node.payloadLearnMoreUrl}
            onChange={this.onChangePayloadLearnMoreUrl}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="HtmlContent">
          <StringInput
            /* @ts-ignore */
            value={node.payloadHtmlContent}
            onChange={this.onChangePayloadHtmlContent}
          />
        </InputGroup>
      </>;
      case 'link': return <>
        { /* @ts-ignore */ }
        <InputGroup name="Url">
          <StringInput
            /* @ts-ignore */
            value={node.payloadUrl}
            onChange={this.onChangePayloadUrl}
          />
        </InputGroup>
      </>;
      default: break;
    }
  }
  renderInteractableDependantFields = (node) => {
    switch (node.interactable){
      case true: return <>
        { /* @ts-ignore */ }
        <InputGroup name="Interaction Text">
        { /* @ts-ignore */ }
          <StringInput
            /* @ts-ignore */
            value={node.interactionText}
            onChange={this.onChangeInteractionText}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Interaction Type">
          { /* @ts-ignore */}
          <SelectInput
            options={InteractableOption}
            value={node.interactionType}
            onChange={this.onChangeInteractionType}
          />
        </InputGroup>
        {this.renderInteractableTypeOptions(node)}
      </>;
      default: break;
    }
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
        { /* @ts-ignore */ }
        <InputGroup name="Interactable">
          <BooleanInput
            value={node.interactable}
            onChange={this.onChangeInteractable}
          />
        </InputGroup>
        {this.renderInteractableDependantFields(node)}
      </NodeEditor>
    );
  }
}
