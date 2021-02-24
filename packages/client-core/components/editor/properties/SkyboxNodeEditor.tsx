import React, { Component } from "react";
import CompoundNumericInput from "../inputs/CompoundNumericInput";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import RadianNumericInputGroup from "../inputs/RadianNumericInputGroup";
import NodeEditor from "./NodeEditor";
import { Cloud } from "@styled-icons/fa-solid/Cloud";
import { EquirectangularOption } from "./EquirectangularList";
import { CubemapOption } from "./CubemapList";
import { node } from "prop-types";

const hoursToRadians = hours => hours / 24;
const radiansToHours = rads => rads * 24;

/**
 * [SkyOption array containing skyType options]
 * @type {Array}
 */
const SkyOption = [
  {
    label: "skybox",
    value: "skybox"
  },
  {
    label: "cubemap",
    value: "cubemap"
  },
  {
    label: "equirectangular",
    value: "equirectangular"
  }
];

/**
 * [SkyboxNodeEditorProps declairing props for SkyboxNodeEditor]
 * @type {Object}
 */
type SkyboxNodeEditorProps = {
  editor?: object;
  node?: object;
};

/**
 * [SkyboxNodeEditor component class used to render editor view to customize component property]
 * @type {class component}
 */
export default class SkyboxNodeEditor extends Component<
  SkyboxNodeEditorProps,
  {}
  > {

  //defining iconComponent with icon name
  static iconComponent = Cloud;

  //function to handle changes in turbidity Property
  onChangeTurbidity = turbidity => {
    (this.props.editor as any).setPropertySelected("turbidity", turbidity);
  };

  //function to handle changes in rayleigh property
  onChangeRayleigh = rayleigh => {
    (this.props.editor as any).setPropertySelected("rayleigh", rayleigh);
  };

  //function to handle the changes in luminance property
  onChangeLuminance = luminance => {
    (this.props.editor as any).setPropertySelected("luminance", luminance);
  };

  //function to handle the changes in mieCoefficient property
  onChangeMieCoefficient = mieCoefficient => {
    (this.props.editor as any).setPropertySelected("mieCoefficient", mieCoefficient);
  };

  //function to handle the changes in mieDirectionalG property
  onChangeMieDirectionalG = mieDirectionalG => {
    (this.props.editor as any).setPropertySelected("mieDirectionalG", mieDirectionalG);
  };

  //function to handle the changes in inclination
  onChangeInclination = inclination => {
    (this.props.editor as any).setPropertySelected("inclination", inclination);
  };

  //function to handle changes azimuth
  onChangeAzimuth = azimuth => {
    (this.props.editor as any).setPropertySelected("azimuth", azimuth);
  };

  //function to handle changes in distance property
  onChangeDistance = distance => {
    (this.props.editor as any).setPropertySelected("distance", distance);
  };

  //function to handle the changes skyOptionValue
  onChangeSkyOption = skyOptionValue => {
    this.onChangeTextureOption(null);
    (this.props.editor as any).setPropertySelected(
      "skyOptionValue",
      skyOptionValue
    );
    this.setDefaultTextureOptionValue(skyOptionValue);
  };

  // function to handle changes textureOptionValue
  onChangeTextureOption = textureOptionValue => {
    (this.props.editor as any).setPropertySelected(
      "textureOptionValue",
      textureOptionValue
    );
  };

 // function to set default texture option on the basis of skyOptionValue
  setDefaultTextureOptionValue = (skyOptionValue) => {

    switch (skyOptionValue) {
      case "cubemap" as any:
        this.onChangeTextureOption(CubemapOption[0].value);
        break;
      case "equirectangular" as any:
        this.onChangeTextureOption(EquirectangularOption[0].value);
        break;
      default:
        this.onChangeTextureOption(null);
        break;
    }
  }
  //creating editor view for skybox setting
  renderSkyboxSettings = node =>
    <>
      { /* @ts-ignore */}
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
      { /* @ts-ignore */}
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
      { /* @ts-ignore */}
      <InputGroup name="Luminance">
        <CompoundNumericInput
          min={0.001}
          max={1.189}
          step={0.001}
          value={node.luminance}
          onChange={this.onChangeLuminance}
        />
      </InputGroup>
      { /* @ts-ignore */}
      <InputGroup name="Scattering Amount">
        <CompoundNumericInput
          min={0}
          max={0.1}
          step={0.001}
          value={node.mieCoefficient}
          onChange={this.onChangeMieCoefficient}
        />
      </InputGroup>
      { /* @ts-ignore */}
      <InputGroup name="Scattering Distance">
        <CompoundNumericInput
          min={0}
          max={1}
          step={0.001}
          value={node.mieDirectionalG}
          onChange={this.onChangeMieDirectionalG}
        />
      </InputGroup>
      { /* @ts-ignore */}
      <InputGroup name="Horizon Start">
        <CompoundNumericInput
          min={1}
          max={20}
          value={node.turbidity}
          onChange={this.onChangeTurbidity}
        />
      </InputGroup>
      { /* @ts-ignore */}
      <InputGroup name="Horizon End">
        <CompoundNumericInput
          min={0}
          max={4}
          value={node.rayleigh}
          onChange={this.onChangeRayleigh}
        />
      </InputGroup>
    </>;

  //creating editor view for equirectangular Settings
  renderEquirectangularSettings = (node) =>
    <>
      { /* @ts-ignore */}
      <InputGroup name="Texture">
        { /* @ts-ignore */}
        <SelectInput
          options={EquirectangularOption}
          value={(node as any).textureOptionValue}
          onChange={this.onChangeTextureOption}
        />
      </InputGroup>
    </>

  // creating editor view for cubemap Settings
  renderCubemapSettings = (node) =>
    <>
      { /* @ts-ignore */}
      <InputGroup name="Texture">
        { /* @ts-ignore */}
        <SelectInput
          options={CubemapOption}
          value={(node as any).textureOptionValue}
          onChange={this.onChangeTextureOption}
        />
      </InputGroup>
    </>

  // creating editor view for skybox Properties
  renderSkyBoxProps = (node) => {
    switch (node.skyOptionValue) {
      case "cubemap" as any:
        return this.renderCubemapSettings(node);
      case "equirectangular" as any:
        return this.renderEquirectangularSettings(node);
      default:
        return this.renderSkyboxSettings(node);
    }
  }

  // rendering editor view for SkyboxNode
  render() {
    const node = this.props.node as any;
    return (
      /* @ts-ignore */
      <NodeEditor description={SkyboxNodeEditor.description} {...this.props}>
        { /* @ts-ignore */}
        <InputGroup name="Sky Type">
          { /* @ts-ignore */}
          <SelectInput
            options={SkyOption}
            value={(node as any).skyOptionValue ? (node as any).skyOptionValue : SkyOption[0].value}
            onChange={this.onChangeSkyOption}
          />
        </InputGroup>
        {this.renderSkyBoxProps(node)}
      </NodeEditor>
    );
  }
}
