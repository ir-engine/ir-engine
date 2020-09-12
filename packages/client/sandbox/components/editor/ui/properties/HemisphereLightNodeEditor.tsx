import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import ColorInput from "../inputs/ColorInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import { Certificate } from "@styled-icons/fa-solid/Certificate";
type HemisphereLightNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class HemisphereLightNodeEditor extends Component<
  HemisphereLightNodeEditorProps,
  {}
> {
  onChangeSkyColor = skyColor => {
    (this.props.editor as any).setPropertySelected("skyColor", skyColor);
  };
  onChangeGroundColor = groundColor => {
    (this.props.editor as any).setPropertySelected("groundColor", groundColor);
  };
  onChangeIntensity = intensity => {
    (this.props.editor as any).setPropertySelected("intensity", intensity);
  };
  render() {
    const node = this.props.node;
    return (
      <NodeEditor
        {...this.props}
        /* @ts-ignore */
        description={HemisphereLightNodeEditor.description}
      >
        { /* @ts-ignore */ }
        <InputGroup name="Sky Color">
        { /* @ts-ignore */ }
          <ColorInput value={node.skyColor} onChange={this.onChangeSkyColor} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Ground Color">
        { /* @ts-ignore */ }
          <ColorInput
            value={(node as any).groundColor}
            onChange={this.onChangeGroundColor}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Intensity"
          min={0}
          smallStep={0.001}
          mediumStep={0.01}
          largeStep={0.1}
          value={(node as any).intensity}
          onChange={this.onChangeIntensity}
          unit="cd"
        />
      </NodeEditor>
    );
  }
}
