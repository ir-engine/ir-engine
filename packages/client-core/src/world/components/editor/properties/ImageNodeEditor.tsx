import React from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import BooleanInput from "../inputs/BooleanInput";
import NumericInputGroup from "../inputs/NumericInputGroup";
import { ImageProjection, ImageAlphaMode } from "@xr3ngine/engine/src/scene/classes/Image";
import ImageInput from "../inputs/ImageInput";
import { Image } from "@styled-icons/fa-solid/Image";
import useSetPropertySelected from "./useSetPropertySelected";
//
const mapValue = v => ({ label: v, value: v });
const imageProjectionOptions = Object.values(ImageProjection).map(mapValue);
const imageTransparencyOptions = Object.values(ImageAlphaMode).map(mapValue);
/**
 * [ImageNodeEditor used to dynamicaly adding an image to scene]
 * @param       {[type]} props
 * @constructor
 */
export default function ImageNodeEditor(props) {
  const { editor, node } = props;

  //function used to handle the change in src property  of ImageNodeEditor
  const onChangeSrc = useSetPropertySelected(editor, "src");

  //function used to handle the change in controls property used as a checkbox in customization view
  const onChangeControls = useSetPropertySelected(editor, "controls");

  //function used to handle the change in Projection property
  const onChangeProjection = useSetPropertySelected(editor, "projection");

  //function used to handle the change in alphaMode property
  const onChangeTransparencyMode = useSetPropertySelected(editor, "alphaMode");

  //function used to handle the change in alphaCutoff property
  const onChangeAlphaCutoff = useSetPropertySelected(editor, "alphaCutoff");

//creating image customization view
  return (
    <NodeEditor description={ImageNodeEditor.description} {...props}>
      { /* @ts-ignore */ }
      <InputGroup name="Image Url">
        <ImageInput value={node.src} onChange={onChangeSrc} />
      </InputGroup>
      { /* @ts-ignore */ }
      <InputGroup name="Controls" info="Toggle the visibility of the media controls in Hubs.">
        <BooleanInput value={node.controls} onChange={onChangeControls} />
      </InputGroup>
      { /* @ts-ignore */ }
      <InputGroup
        name="Transparency Mode"
        info={`How to apply transparency:
'opaque' = no transparency
'blend' = use the images alpha channel
'mask' = Use a specified cutoff value for on/off transparency (more performant)
`}
      >
        { /* @ts-ignore */ }
        <SelectInput options={imageTransparencyOptions} value={node.alphaMode} onChange={onChangeTransparencyMode} />
      </InputGroup>
      {node.alphaMode === ImageAlphaMode.Mask && (
        /* @ts-ignore */
        <NumericInputGroup
          name="Alpha Cutoff"
          info="Pixels with alpha values lower than this will be transparent"
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.25}
          value={node.alphaCutoff}
          onChange={onChangeAlphaCutoff}
        />
      )}
      { /* @ts-ignore */ }
      <InputGroup name="Projection">
      { /* @ts-ignore */ }
        <SelectInput options={imageProjectionOptions} value={node.projection} onChange={onChangeProjection} />
      </InputGroup>
    </NodeEditor>
  );
}


//declairig propTypes for ImageNodeEditor
ImageNodeEditor.propTypes = {
  editor: PropTypes.object,
  node: PropTypes.object,
  multiEdit: PropTypes.bool
};

//intailising iconComponent with icon name
ImageNodeEditor.iconComponent = Image;

//intailising description and will appears on ImageNodeEditor view.
ImageNodeEditor.description = "Dynamically loads an image.";
