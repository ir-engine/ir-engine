import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import SelectInput from "../inputs/SelectInput";
import InputGroup from "../inputs/InputGroup";
import BooleanInput from "../inputs/BooleanInput";
import ModelInput from "../inputs/ModelInput";
import { Cube } from "@styled-icons/fa-solid/Cube";
import StringInput from "../inputs/StringInput";

/**
 * [array containing options for InteractableOption ]
 * @type {Array}
 */
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

/**
 * [declairing properties for ModalNodeEditor component]
 * @type {Object}
 */
type ModelNodeEditorProps = {
  editor?: object;
  node?: object;
  multiEdit?: boolean;
};

/**
 * [ModelNodeEditor used to create editor view for the properties of ModelNode]
 * @type {class component}
 */
export default class ModelNodeEditor extends Component<
  ModelNodeEditorProps,
  {}
> {

  //initializing iconComponent with image name
  static iconComponent = Cube;

  //initializing description and will appears on the editor view
  static description = "A 3D model in your scene, loaded from a GLTF URL or file.";

  //function to handle change in property src
  onChangeSrc = (src, initialProps) => {
    (this.props.editor as any).setPropertiesSelected({ ...initialProps, src });
  };

  //fucntion to handle changes in activeChipIndex property
  onChangeAnimation = activeClipIndex => {
    (this.props.editor as any).setPropertySelected("activeClipIndex", activeClipIndex);
  };

  //function to handle change in collidable property
  onChangeCollidable = collidable => {
    (this.props.editor as any).setPropertySelected("collidable", collidable);
  };

  // function to handle changes in walkable property
  onChangeWalkable = walkable => {
    (this.props.editor as any).setPropertySelected("walkable", walkable);
  };

  // function to handle changes in castShadow property
  onChangeCastShadow = castShadow => {
    (this.props.editor as any).setPropertySelected("castShadow", castShadow);
  };

  // function to handle changes in Receive shadow property
  onChangeReceiveShadow = receiveShadow => {
    (this.props.editor as any).setPropertySelected("receiveShadow", receiveShadow);
  };

  // function to handle changes in interactable property
  onChangeInteractable = interactable => {
    (this.props.editor as any).setPropertySelected("interactable", interactable);
  };

  // function to handle changes in interactionType property
  onChangeInteractionType = interactionType => {
    (this.props.editor as any).setPropertySelected("interactionType", interactionType);
  };

  // function to handle changes in interactionText property
  onChangeInteractionText = interactionText => {
    (this.props.editor as any).setPropertySelected("interactionText", interactionText);
  };

  // function to handle changes in payloadName property
  onChangePayloadName = payloadName => {
    (this.props.editor as any).setPropertySelected("payloadName", payloadName);
  };

  // function to handle changes in payloadUrl
  onChangePayloadUrl = payloadUrl => {
    (this.props.editor as any).setPropertySelected("payloadUrl", payloadUrl);
  };

  // function to handle changes in payloadBuyUrl
  onChangePayloadBuyUrl = payloadBuyUrl => {
    (this.props.editor as any).setPropertySelected("payloadBuyUrl", payloadBuyUrl);
  };

  // function to handle changes in payloadLearnMoreUrl
  onChangePayloadLearnMoreUrl = payloadLearnMoreUrl => {
    (this.props.editor as any).setPropertySelected("payloadLearnMoreUrl", payloadLearnMoreUrl);
  };

  // function to handle changes in payloadHtmlContent
  onChangePayloadHtmlContent = payloadHtmlContent => {
    (this.props.editor as any).setPropertySelected("payloadHtmlContent", payloadHtmlContent);
  };

  // function to handle changes in isAnimationPropertyDisabled
  isAnimationPropertyDisabled() {
    const { multiEdit, editor, node } = this.props as any;
    if (multiEdit) {
      return editor.selected.some(
        selectedNode => selectedNode.src !== node.src
      );
    }
    return false;
  }

// creating view for interactable type
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
      default: break;
    }
  }

  // creating view for dependent fields
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

  // rendering view of ModelNodeEditor
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
