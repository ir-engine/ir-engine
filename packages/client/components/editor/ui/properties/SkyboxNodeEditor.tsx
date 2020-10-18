import React, { Component } from "react";
import CompoundNumericInput from "../inputs/CompoundNumericInput";
import InputGroup from "../inputs/InputGroup";
import NumericInputGroup from "../inputs/NumericInputGroup";
import RadianNumericInputGroup from "../inputs/RadianNumericInputGroup";
import NodeEditor from "./NodeEditor";
import { Cloud } from "@styled-icons/fa-solid/Cloud";
const hoursToRadians = hours => hours / 24;
const radiansToHours = rads => rads * 24;
type SkyboxNodeEditorProps = {
  editor?: object;
  node?: object;
};
export default class SkyboxNodeEditor extends Component<
  SkyboxNodeEditorProps,
  {}
> {
  static iconComponent = Cloud;
  onChangeTurbidity = turbidity => {
    (this.props.editor as any).setPropertySelected("turbidity", turbidity);
  };
  onChangeRayleigh = rayleigh => {
    (this.props.editor as any).setPropertySelected("rayleigh", rayleigh);
  };
  onChangeLuminance = luminance => {
    (this.props.editor as any).setPropertySelected("luminance", luminance);
  };
  onChangeMieCoefficient = mieCoefficient => {
    (this.props.editor as any).setPropertySelected("mieCoefficient", mieCoefficient);
  };
  onChangeMieDirectionalG = mieDirectionalG => {
    (this.props.editor as any).setPropertySelected("mieDirectionalG", mieDirectionalG);
  };
  onChangeInclination = inclination => {
    (this.props.editor as any).setPropertySelected("inclination", inclination);
  };
  onChangeAzimuth = azimuth => {
    (this.props.editor as any).setPropertySelected("azimuth", azimuth);
  };
  onChangeDistance = distance => {
    (this.props.editor as any).setPropertySelected("distance", distance);
  };
  render() {
    const node = this.props.node as any;
    return (
      /* @ts-ignore */ 
      <NodeEditor description={SkyboxNodeEditor.description} {...this.props}>
        { /* @ts-ignore */ }
        <NumericInputGroup
          name="Time of Day"
          smallStep={0.1}
          mediumStep={0.5}
          largeStep={1}
          min={0}
          max={24}
          convertFrom={radiansToHours}
          convertTo={hoursToRadians}
          value={node.azimuth}
          onChange={this.onChangeAzimuth}
          unit="h"
        />
        { /* @ts-ignore */ }
        <RadianNumericInputGroup
          name="Latitude"
          min={-90}
          max={90}
          smallStep={0.1}
          mediumStep={0.5}
          largeStep={1}
          value={node.inclination}
          onChange={this.onChangeInclination}
        />
        { /* @ts-ignore */ }
        <InputGroup name="Luminance">
          <CompoundNumericInput
            min={0.001}
            max={1.189}
            step={0.001}
            value={node.luminance}
            onChange={this.onChangeLuminance}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Scattering Amount">
          <CompoundNumericInput
            min={0}
            max={0.1}
            step={0.001}
            value={node.mieCoefficient}
            onChange={this.onChangeMieCoefficient}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Scattering Distance">
          <CompoundNumericInput
            min={0}
            max={1}
            step={0.001}
            value={node.mieDirectionalG}
            onChange={this.onChangeMieDirectionalG}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Horizon Start">
          <CompoundNumericInput
            min={1}
            max={20}
            value={node.turbidity}
            onChange={this.onChangeTurbidity}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Horizon End">
          <CompoundNumericInput
            min={0}
            max={4}
            value={node.rayleigh}
            onChange={this.onChangeRayleigh}
          />
        </InputGroup>
      </NodeEditor>
    );
  }
}
